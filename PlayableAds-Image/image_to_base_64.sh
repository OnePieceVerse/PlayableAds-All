#!/bin/bash
set -e
SRC='.'
DIST='.'

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
