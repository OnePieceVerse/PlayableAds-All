#!/bin/bash

# 将图片和视频转为base64并直接嵌入到HTML文件中
PARTNER_NAME="HOK"
PLATFORM_NAME="tiktok"
DIRECTION='portrait'

echo "开始处理文件..."

# 创建HTML文件备份
echo "创建HTML文件备份..."
cp index.html index-v1.html
cp index2.html index-v2.html
echo "备份已创建."

# 处理视频文件
if [ -f "honor-of-kings-v2.mp4" ]; then
  echo "正在将视频转为base64格式（大文件可能需要一些时间）..."
  VIDEO_BASE64=$(base64 -i honor-of-kings-v2.mp4 | tr -d '\n')
  

  # 处理HTML文件
  for HTML_FILE in index-v1.html index-v2.html; do
    echo "正在修改 ${HTML_FILE}..."
    
    # 创建临时文件
    TEMP_FILE="${HTML_FILE}.temp"
    VERSION=${HTML_FILE#index-}  # Remove "index-" prefix
    VERSION=${VERSION%.html}     # Remove ".html" suffix

    # 使用文件读写而不是sed
    while IFS= read -r line; do
      # 检查是否为</head>行，在其前添加script标签和base64数据
      if [[ "$line" == *"<script>"* ]]; then
        printf '<script>\n' >> "$TEMP_FILE"
        printf '// 视频base64数据\n' >> "$TEMP_FILE"
        printf 'const videoBase64 = "data:video/mp4;base64,' >> "$TEMP_FILE" # 注意这里没有换行符
        printf "%s" "$VIDEO_BASE64" >> "$TEMP_FILE" # 使用 %s 格式符安全地输出变量内容，避免变量内容包含特殊字符导致意外行为
        printf '";\n' >> "$TEMP_FILE"
        printf '</script>\n' >> "$TEMP_FILE"
      fi
      
      # 替换视频源引用
      if [[ "$line" == *'src="honor-of-kings-v2.mp4"'* ]]; then
        echo "$line" | sed 's|src="honor-of-kings-v2.mp4"|src="javascript:videoBase64"|' >> "$TEMP_FILE"
      else
        echo "$line" >> "$TEMP_FILE"
      fi

    done < "$HTML_FILE"
    
    if [ "$PLATFORM_NAME" == "facebook" ]; then
        sed -i '' "s|window.location.href = '#';|FbPlayableAd.onCTAClick();|g" "$TEMP_FILE"
    elif [ "$PLATFORM_NAME" == "google" ]; then
        sed -i '' "s|window.location.href = '#';|ExitApi.exit();|g" "$TEMP_FILE"
        # 添加Google特定的meta标签和script
        if [[ "$OSTYPE" == "darwin"* ]]; then
          sed -i '' "/<head>/a\\
          <meta name=\"ad.orientation\" content=\"${DIRECTION}\">\\
          <script type=\"text/javascript\" src=\"https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js\"> </script>" $TEMP_FILE
        else
          sed -i "/<head>/a\\    <meta name=\"ad.orientation\" content=\"${DIRECTION}\">\\n    <script type=\"text/javascript\" src=\"https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js\"> </script>" $tmpfile
        fi
    elif [ "$PLATFORM_NAME" == "tiktok" ]; then
        sed -i '' "s|window.location.href = '#';|window.openAppStore();|g" "$TEMP_FILE"
        # 添加TikTok特定的script，检查是否已存在
      SCRIPT_TO_INSERT='<script src="https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js"> </script>'
      # 检查是否已存在该引用，如果不存在，则在第一个<script>标签前插入
      case "$OSTYPE" in
          darwin*) sed -i '' "/<\/body>/a\\
              $SCRIPT_TO_INSERT
              " "$TEMP_FILE" ;;
          *) sed -i "/<\/body>/a$SCRIPT_TO_INSERT" "$TEMP_FILE" ;;
      esac
    fi

    # 替换原文件
    mv "$TEMP_FILE" "$HTML_FILE"
    FILE_NAME="index.html"
    DIST="output"
    mkdir -p $DIST
    if [ "$PLATFORM_NAME" == "facebook" ]; then
      FILE_NAME="$PARTNER_NAME-$PLATFORM_NAME-$VERSION".html
    fi
    mv "$HTML_FILE" $DIST/"$FILE_NAME"

    if [ "$PLATFORM_NAME" == "google" ] || [ "$PLATFORM_NAME" == "tiktok" ]; then
        cd $DIST
        if [ "$PLATFORM_NAME" == "tiktok" ];then
          cp ../config.json .
          zip -r "${PARTNER_NAME}-${PLATFORM_NAME}-${VERSION}.zip" $FILE_NAME config.json
          rm -f config.json
        else
          zip -r "${PARTNER_NAME}-${PLATFORM_NAME}-${VERSION}.zip" $FILE_NAME
        fi
        rm $FILE_NAME
        cd ..
    fi
  done
  
  
  echo "视频处理完成."
else
  echo "错误：视频文件 'honor-of-kings-v2.mp4' 不存在!"
  exit 1
fi

echo "所有文件处理完成!" 