#!/bin/bash
set -e

# 语言，可配置
VERSION='en-v5'
# 目标配置文件，注意index.html中默认的配置，若不是config-test-zh.js，会替换失败
CONFIG="config-${VERSION}.js"
TARGET="index-applovin-${VERSION}.html"
tmpfile=$(mktemp)


sh image_video_to_base_64.sh

awk '
  /<link rel="stylesheet" href="style.css">/ {
    print "  <style>"
    while ((getline line < css_file) > 0) print line
    close(css_file)
    print "  </style>"
    next
  }
  /<script src="images.js"><\/script>/ {
    print "  <script>"
    while ((getline line < images_js_file) > 0) print line
    close(images_js_file)
    print "  </script>"
    next
  }
    /<script src="videos.js"><\/script>/ {
    print "  <script>"
    while ((getline line < videos_js_file) > 0) print line
    close(videos_js_file)
    print "  </script>"
    next
  }
  /<script src="config-[^"]*"><\/script>/ {
    print "  <script>"
    while ((getline line < config_js_file) > 0) print line
    close(config_js_file)
    print "  </script>"
    next
  }
    /<script src="lang.js"><\/script>/ {
    print "  <script>"
    while ((getline line < lang_js_file) > 0) print line
    close(lang_js_file)
    print "  </script>"
    next
  }
  /<script src="main.js"><\/script>/ {
    print "  <script>"
    while ((getline line < main_js_file) > 0) print line
    close(main_js_file)
    print "  </script>"
    next
  }
  { print }
' \
  css_file="style.css" \
  images_js_file="images.js" \
  videos_js_file="videos.js" \
  config_js_file="$CONFIG" \
  lang_js_file="lang.js" \
  main_js_file="main.js" \
  index.html > $tmpfile
  
mv $tmpfile $TARGET
# npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true $tmpfile -o $TARGET

echo "✅ Applovin单页面已生成：$TARGET, 配置：$CONFIG"