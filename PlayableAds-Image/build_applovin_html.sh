#!/bin/bash
set -e

# 业务，可配置
BUSINESS='test'
# 语言，可配置
LANGUAGE='zh'
# 目标配置文件，注意index.html中默认的配置，若不是config-test-zh.js，会替换失败
CONFIG="config-${BUSINESS}-${LANGUAGE}.js"
TARGET='index-applovin.html'
tmpfile=$(mktemp)

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
  /<script src="config-test-zh.js"><\/script>/ {
    print "  <script>"
    while ((getline line < config_js_file) > 0) print line
    close(config_js_file)
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
  config_js_file="$CONFIG" \
  main_js_file="main.js" \
  index.html > $tmpfile
  
mv $tmpfile $TARGET
# npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true $tmpfile -o $TARGET

echo "✅ Applovin单页面已生成：$TARGET, 配置：$CONFIG"