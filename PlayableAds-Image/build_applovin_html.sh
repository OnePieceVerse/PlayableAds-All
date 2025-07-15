#!/bin/bash
set -e

SRC='.'
TARGET='index-applovin.html'

# 读取内联资源
HTML=$(<"$SRC/index.html")
CSS=$(<"$SRC/style.css")
IMAGES_JS=$(<"$SRC/images.js")
MAIN_JS=$(<"$SRC/main.js")

tmpfile=$(mktemp)
echo $HTML > $tmpfile

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
  main_js_file="main.js" \
  index.html > $tmpfile
  
# mv $tmpfile $TARGET
npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true $tmpfile -o $TARGET

echo "✅ Applovin单页面已生成：$TARGET"