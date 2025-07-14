#!/bin/bash

# 0. 安装依赖
# npm install --save-dev terser clean-css-cli html-minifier imagemin-cli archiver javascript-obfuscator

set -e

SRC="PlayableAds-Image"
DIST="PlayableAds-Image-dist"

# 1. 清理旧目录
rm -rf $DIST
mkdir -p $DIST

# 2. 压缩HTML
npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true $SRC/index.html -o $DIST/index.html

# 3. 压缩CSS
npx cleancss -o $DIST/style.css $SRC/style.css

# 4. 压缩并混淆JS，javascript-obfuscator混淆能力更强
# npx terser $SRC/main.js -o $DIST/main.js --compress --mangle
npx javascript-obfuscator $SRC/main.js --output $DIST/main.js

# 5. 压缩JSON
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('$SRC/config.json','utf8'))))" > $DIST/config.json

# 6. 压缩图片（输出到dist/images）
mkdir -p $DIST/images
npx imagemin $SRC/images/* --out-dir=$DIST/images

# 7. 拷贝其它资源（如有）
# cp -r $SRC/other $DIST/other

# 8. 打包为zip
cd $DIST
zip -r ../PlayableAds-Image-dist.zip ./*
cd ..

echo "✅ 打包完成，输出文件：PlayableAds-Image-dist.zip"