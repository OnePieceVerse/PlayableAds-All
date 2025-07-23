#!/bin/bash
set -e
SRC='assets'
DIST='.'

# 检查ffmpeg是否安装
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is required but not installed."
    exit 1
fi

# 生成 PLAYABLE_IMAGES 变量
echo "window.PLAYABLE_IMAGES = {" > $DIST/images.js
first=1
for img in $SRC/images/*; do
  [ -f "$img" ] || continue
  fname=$(basename "$img")
  ext="${img##*.}"
  mime="image/$ext"
  [ "$ext" = "png" ] && mime="image/png"
  [ "$ext" = "svg" ] && mime="image/svg+xml"
  b64=$(base64 < "$img" | tr -d '\n')
  uri="data:$mime;base64,$b64"
  if [ $first -eq 1 ]; then
    first=0
  else
    echo "," >> $DIST/images.js
  fi
  echo "  \"$fname\": \"$uri\"" >> $DIST/images.js
done
echo "};" >> $DIST/images.js

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# 生成 PLAYABLE_VIDEOS 变量
echo "window.PLAYABLE_VIDEOS = {" > $DIST/videos.js
first=1
for video in $SRC/videos/*; do
  [ -f "$video" ] || continue
  fname=$(basename "$video")
  ext="${video##*.}"
  
  # 获取输出文件名
  output_fname="${fname%.*}.mp4"
  output_path="$TEMP_DIR/$output_fname"
  
  # 如果是MOV格式，转换为MP4
  if [ "$ext" = "mov" ]; then
    echo "Converting $fname to MP4..."
    ffmpeg -i "$video" -c:v libx264 -c:a aac -strict experimental -b:a 192k -movflags faststart "$output_path" -y
    video="$output_path"
    ext="mp4"
  fi
  
  # 设置正确的MIME类型
  case "$ext" in
    "mp4") mime="video/mp4" ;;
    "webm") mime="video/webm" ;;
    "mov") mime="video/quicktime" ;;
    *) mime="video/$ext" ;;
  esac
  
  b64=$(base64 < "$video" | tr -d '\n')
  uri="data:$mime;base64,$b64"
  if [ $first -eq 1 ]; then
    first=0
  else
    echo "," >> $DIST/videos.js
  fi
  echo "  \"$output_fname\": \"$uri\"" >> $DIST/videos.js
done
echo "};" >> $DIST/videos.js