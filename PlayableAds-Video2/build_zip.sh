#!/bin/bash
# 构建平台的静态HTML网站资源zip包

set -e

# 配置参数
PARTNER_NAME="abyss-voyage"
VERSION="en-v4"
PLATFORM_NAME="facebook"
BUILD_DIR="build_${PLATFORM_NAME}"
PLATFORM_DIR="partners/${PARTNER_NAME}/platforms/${PLATFORM_NAME}/${VERSION}"

echo "开始构建 ${PLATFORM_NAME} 平台的静态HTML网站资源包..."
echo "Partner: ${PARTNER_NAME}"
echo "Version: ${VERSION}"

# 创建构建目录
if [ -d "$BUILD_DIR" ]; then
    echo "清理旧的构建目录..."
    rm -rf "$BUILD_DIR"
    rm -rf "$PLATFORM_DIR"
fi

echo "创建构建目录: ${BUILD_DIR}"
mkdir -p "$BUILD_DIR"

# 复制核心文件
echo "复制核心文件..."
cp main.js "$BUILD_DIR/"
cp style.css "$BUILD_DIR/"

# 复制原始的index.html文件
echo "复制原始index.html文件..."
cp index.html "$BUILD_DIR/"
BUILD_HTML_FILE="$BUILD_DIR/index.html"
sed -i '' "s|<script src=\"videos.js\"></script>||g" "$BUILD_HTML_FILE"
sed -i '' "s|<script src=\"images.js\"></script>||g" "$BUILD_HTML_FILE"
sed -i '' "s|<script src=\"lang.js\"></script>||g" "$BUILD_HTML_FILE"
sed -i '' "s|<script src=\"partners/[^/]*/lang.js\"></script>||g" "$BUILD_HTML_FILE"
sed -i '' "s|<script src=\"partners/[^/]*/configs/config-[^/]*\.js\"></script>||g" "$BUILD_HTML_FILE"


# 复制partner相关文件
echo "复制partner相关文件..."
mkdir -p "$BUILD_DIR/partners/${PARTNER_NAME}/configs"
# 分析配置文件，动态解析需要的资源文件
CONFIG_FILE="partners/${PARTNER_NAME}/configs/config-${VERSION}.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误: 配置文件 $CONFIG_FILE 不存在"
    exit 1
fi
cp -r "$CONFIG_FILE" "$BUILD_DIR/partners/${PARTNER_NAME}/configs/"

# 从配置文件中提取需要的图片文件
echo "解析配置文件中的图片资源..."
NEEDED_IMAGES=()

# 提取buttonImage
BUTTON_IMAGES=$(grep -o '"buttonImage": "[^"]*"' "$CONFIG_FILE" | sed 's/"buttonImage": "\([^"]*\)"/\1/' | sort -u)
for img in $BUTTON_IMAGES; do
    if [[ ! " ${NEEDED_IMAGES[@]} " =~ " ${img} " ]]; then
        NEEDED_IMAGES+=("$img")
        echo "  - 发现buttonImage: $img"
    fi
done

# 提取guideImage
GUIDE_IMAGES=$(grep -o '"guideImage": "[^"]*"' "$CONFIG_FILE" | sed 's/"guideImage": "\([^"]*\)"/\1/' | sort -u)
for img in $GUIDE_IMAGES; do
    if [[ ! " ${NEEDED_IMAGES[@]} " =~ " ${img} " ]]; then
        NEEDED_IMAGES+=("$img")
        echo "  - 发现guideImage: $img"
    fi
done

# 从配置文件中提取需要的视频文件
echo "解析配置文件中的视频资源..."
NEEDED_VIDEOS=()

# 提取videoUrl
VIDEO_URL=$(grep -o '"videoUrl": "[^"]*"' "$CONFIG_FILE" | sed 's/"videoUrl": "\([^"]*\)"/\1/')
if [ ! -z "$VIDEO_URL" ]; then
    NEEDED_VIDEOS+=("$VIDEO_URL")
    echo "  - 发现videoUrl: $VIDEO_URL"
fi

echo "需要的图片文件: ${NEEDED_IMAGES[*]}"
echo "需要的视频文件: ${NEEDED_VIDEOS[*]}"

# 复制需要的资源文件
echo "复制需要的资源文件..."

# 复制图片文件
mkdir -p "$BUILD_DIR/assets/images"
for img in "${NEEDED_IMAGES[@]}"; do
    # 检查文件是否在assets/images目录
    if [ -f "assets/images/$img" ]; then
        cp "assets/images/$img" "$BUILD_DIR/assets/images"
        echo "  - 复制 assets/images/$img"
    # 检查文件是否在partner的images目录
    elif [ -f "partners/${PARTNER_NAME}/images/$img" ]; then
        mkdir -p "$BUILD_DIR/partners/${PARTNER_NAME}/images"
        cp "partners/${PARTNER_NAME}/images/$img" "$BUILD_DIR/partners/${PARTNER_NAME}/images/"
        echo "  - 复制 partners/${PARTNER_NAME}/images/$img"
    else
        echo "  - 警告: 找不到图片文件 $img"
    fi
done

# 复制视频文件
mkdir -p "$BUILD_DIR/partners/${PARTNER_NAME}/videos"
for video in "${NEEDED_VIDEOS[@]}"; do
    if [ -f "partners/${PARTNER_NAME}/videos/$video" ]; then
        cp "partners/${PARTNER_NAME}/videos/$video" "$BUILD_DIR/partners/${PARTNER_NAME}/videos/"
        echo "  - 复制 partners/${PARTNER_NAME}/videos/$video"
    else
        echo "  - 警告: 找不到视频文件 $video"
    fi
done

# 修改配置文件中的资源路径
echo "修改配置文件中的资源路径..."
BUILD_CONFIG_FILE="$BUILD_DIR/partners/${PARTNER_NAME}/configs/config-${VERSION}.js"
# 替换videoUrl路径
for video in "${NEEDED_VIDEOS[@]}"; do
    # 将相对路径替换为完整的partner路径
    sed -i '' "s|\"videoUrl\": \"$video\"|\"videoUrl\": \"partners/${PARTNER_NAME}/videos/$video\"|g" "$BUILD_CONFIG_FILE"
    echo "  - 更新videoUrl: $video -> partners/${PARTNER_NAME}/videos/$video"
done

# 替换buttonImage和guideImage路径
for img in "${NEEDED_IMAGES[@]}"; do
    # 检查图片在哪个目录，然后更新相应的路径
    if [ -f "assets/images/$img" ]; then
        # 图片在assets/images目录，保持相对路径
        sed -i '' "s|\"buttonImage\": \"$img\"|\"buttonImage\": \"assets/images/$img\"|g" "$BUILD_CONFIG_FILE"
        sed -i '' "s|\"guideImage\": \"$img\"|\"guideImage\": \"assets/images/$img\"|g" "$BUILD_CONFIG_FILE"
        echo "  - 保持buttonImage/guideImage路径: $img (在assets/images目录)"
    elif [ -f "partners/${PARTNER_NAME}/images/$img" ]; then
        # 图片在partner的images目录，更新为完整路径
        sed -i '' "s|\"buttonImage\": \"$img\"|\"buttonImage\": \"partners/${PARTNER_NAME}/images/$img\"|g" "$BUILD_CONFIG_FILE"
        sed -i '' "s|\"guideImage\": \"$img\"|\"guideImage\": \"partners/${PARTNER_NAME}/images/$img\"|g" "$BUILD_CONFIG_FILE"
        echo "  - 更新buttonImage/guideImage路径: $img -> partners/${PARTNER_NAME}/images/$img"
    else
        echo "  - 警告: 无法确定图片 $img 的路径，跳过更新"
    fi
done

# 将配置文件内容内联到main.js中
echo "将配置文件内容内联到main.js中..."
BUILD_MAIN_JS="$BUILD_DIR/main.js"
if [ "$PLATFORM_NAME" == "facebook" ]; then
    sed -i '' "s|window.location.href = config.cta_start_button.url;|FbPlayableAd.onCTAClick();|g" "$BUILD_MAIN_JS"
elif [ "$PLATFORM_NAME" == "applovin" ]; then
    sed -i '' "s|window.location.href = config.cta_start_button.url;|window.mraid.open();|g" "$BUILD_MAIN_JS"
fi
# 创建临时配置文件，去掉window.PLAYABLE_CONFIG = 部分
TEMP_CONFIG_FILE="$BUILD_DIR/temp_config.js"
cat "$BUILD_CONFIG_FILE" | sed 's/^window\.PLAYABLE_CONFIG = //' | sed 's/;$//' > "$TEMP_CONFIG_FILE"

# 创建临时语言文件，去掉window.PLAYABLE_LANG = 部分
TEMP_LANG_FILE="$BUILD_DIR/temp_lang.js"
cat "lang.js" | sed 's/^window\.PLAYABLE_LANG = //' | sed 's/;$//' > "$TEMP_LANG_FILE"

# 创建临时partner语言文件，去掉window.PARTNER_LANG = 部分
TEMP_PARTNER_LANG_FILE="$BUILD_DIR/temp_partner_lang.js"
cat "partners/${PARTNER_NAME}/lang.js" | sed 's/^window\.PARTNER_LANG = //' | sed 's/;$//' > "$TEMP_PARTNER_LANG_FILE"

# 创建Node.js脚本来处理替换
NODE_SCRIPT="$BUILD_DIR/replace_config.js"
cat > "$NODE_SCRIPT" << 'EOF'
const fs = require('fs');
const mainJsPath = process.argv[2];
const configPath = process.argv[3];
const langPath = process.argv[4];
const partnerLangPath = process.argv[5];

if (!mainJsPath || !configPath || !langPath || !partnerLangPath) {
    console.error('Usage: node replace_config.js <main.js> <config.js> <lang.js> <partner_lang.js>');
    process.exit(1);
}

try {
    let mainJs = fs.readFileSync(mainJsPath, 'utf8');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const langContent = fs.readFileSync(langPath, 'utf8');
    const partnerLangContent = fs.readFileSync(partnerLangPath, 'utf8');
    
    // 替换const config = window.PLAYABLE_CONFIG;为实际的配置内容
    mainJs = mainJs.replace(
        /const config = window\.PLAYABLE_CONFIG;/g,
        `const config = ${configContent};`
    );
    
    // 替换const publicLang = window.PLAYABLE_LANG || {};为实际的语言内容
    mainJs = mainJs.replace(
        /const publicLang = window\.PLAYABLE_LANG \|\| \{\};/g,
        `const publicLang = ${langContent}`
    );
    
    // 替换const partnerLang = window.PARTNER_LANG || {};为实际的partner语言内容
    mainJs = mainJs.replace(
        /const partnerLang = window\.PARTNER_LANG \|\| \{\};/g,
        `const partnerLang = ${partnerLangContent}`
    );
    
    fs.writeFileSync(mainJsPath, mainJs);
    console.log('配置文件和语言文件内容已成功内联到main.js中');
} catch (error) {
    console.error('处理文件时出错:', error.message);
    process.exit(1);
}
EOF

# 运行Node.js脚本
node "$NODE_SCRIPT" "$BUILD_MAIN_JS" "$TEMP_CONFIG_FILE" "$TEMP_LANG_FILE" "$TEMP_PARTNER_LANG_FILE"

# 清理临时文件
rm "$TEMP_CONFIG_FILE" "$TEMP_LANG_FILE" "$TEMP_PARTNER_LANG_FILE" "$NODE_SCRIPT"

echo "  - 已成功将配置文件和语言文件内容内联到main.js中"

# 将CSS和JS内容内联到HTML文件中
echo "将CSS和JS内容内联到HTML文件中..."

# 读取CSS内容
CSS_CONTENT=$(cat "$BUILD_DIR/style.css")

# 读取JS内容
JS_CONTENT=$(cat "$BUILD_DIR/main.js")

# 创建内联后的HTML文件
INLINE_HTML_FILE="$BUILD_DIR/index_inline.html"
cat > "$INLINE_HTML_FILE" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title data-lang="title"></title>
    <style>
$CSS_CONTENT
    </style>
</head>
<body>
<div class="ad-container">
    <video class="ad-video" id="ad-video" playsinline></video>
    <div class="click-layer" id="clickLayer">
        <div class="click-tip">
            <span data-lang="click_to_play"></span>
            <span class="highlight" data-lang="rotate_tip"></span>
        </div>
        <div class="rotate-icon"></div>
    </div>
    <div class="guide-layer" id="guideLayer"></div>
</div>

<script>
$JS_CONTENT
</script>
</body>
</html>
EOF

# 替换原HTML文件
mv "$INLINE_HTML_FILE" "$BUILD_HTML_FILE"

rm -rf "$BUILD_DIR/style.css" "$BUILD_DIR/main.js" "$BUILD_DIR/partners/${PARTNER_NAME}/configs" "$BUILD_DIR/partners/${PARTNER_NAME}/lang.js" 

echo "  - 已成功将CSS和JS内容内联到HTML文件中"

# 创建ZIP包
echo "创建ZIP包..."
cd "$BUILD_DIR"
zip -r "../${PLATFORM_NAME}_${PARTNER_NAME}_${VERSION}.zip" .
cd ..

echo "构建完成！"
echo "ZIP包位置: ${PLATFORM_NAME}_${PARTNER_NAME}_${VERSION}.zip"
echo "构建目录: ${BUILD_DIR}/"
mkdir -p ${PLATFORM_DIR}
mv ${BUILD_DIR}/* ${PLATFORM_DIR}
mv ${PLATFORM_NAME}_${PARTNER_NAME}_${VERSION}.zip ${PLATFORM_DIR}

# 显示构建结果
echo ""
echo "最终目录内容:"
ls -la "$PLATFORM_DIR" 