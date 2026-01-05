#!/bin/bash

# PlayableAds-All 构建和部署脚本
# 用于构建和部署网站到nginx

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
BUILD_DIR="dist"
PROJECT_NAME="PlayableAds-All"
NGINX_DIR="/data/PlayableAds-All"
MINIFY=true
DEPLOY=false
PACKAGE=true

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-minify)
            MINIFY=false
            shift
            ;;
        --deploy)
            DEPLOY=true
            PACKAGE=false  # 部署模式下不打包
            shift
            ;;
        --no-package)
            PACKAGE=false
            shift
            ;;
        --nginx-dir)
            NGINX_DIR="$2"
            shift 2
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --no-minify      不压缩文件"
            echo "  --deploy         构建后自动部署到nginx目录（部署模式下不打包）"
            echo "  --no-package     不打包为压缩文件"
            echo "  --nginx-dir DIR  指定nginx部署目录（默认: /data/PlayableAds-All）"
            echo "  --help           显示此帮助信息"
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}开始构建...${NC}"

# 1. 清理旧构建目录
echo -e "${YELLOW}清理旧构建目录...${NC}"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# 2. 复制HTML文件
echo -e "${YELLOW}处理HTML文件...${NC}"
for html_file in *.html; do
    if [ -f "$html_file" ]; then
        if [ "$MINIFY" = true ]; then
            echo "  压缩: $html_file"
            npx html-minifier \
                --collapse-whitespace \
                --remove-comments \
                --minify-css true \
                --minify-js true \
                --remove-attribute-quotes \
                --remove-empty-attributes \
                "$html_file" -o "$BUILD_DIR/$html_file"
        else
            cp "$html_file" "$BUILD_DIR/"
        fi
    fi
done

# 3. 复制和压缩CSS文件
echo -e "${YELLOW}处理CSS文件...${NC}"
for css_file in *.css; do
    if [ -f "$css_file" ]; then
        if [ "$MINIFY" = true ]; then
            echo "  压缩: $css_file"
            npx cleancss -o "$BUILD_DIR/$css_file" "$css_file"
        else
            cp "$css_file" "$BUILD_DIR/"
        fi
    fi
done

# 4. 复制和压缩JS文件
echo -e "${YELLOW}处理JS文件...${NC}"
for js_file in *.js; do
    if [ -f "$js_file" ]; then
        if [ "$MINIFY" = true ]; then
            echo "  压缩: $js_file"
            npx terser "$js_file" \
                --compress \
                --mangle \
                --output "$BUILD_DIR/$js_file"
        else
            cp "$js_file" "$BUILD_DIR/"
        fi
    fi
done

# 5. 复制配置文件
echo -e "${YELLOW}复制配置文件...${NC}"
if [ -d "config" ]; then
    mkdir -p "$BUILD_DIR/config"
    # 压缩JSON文件
    for json_file in config/*.json; do
        if [ -f "$json_file" ]; then
            if [ "$MINIFY" = true ]; then
                node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('$json_file','utf8'))))" > "$BUILD_DIR/$json_file"
            else
                cp "$json_file" "$BUILD_DIR/$json_file"
            fi
        fi
    done
    # 复制nginx配置文件（不压缩）
    if [ -f "config/nginx.conf" ]; then
        cp "config/nginx.conf" "$BUILD_DIR/config/"
    fi
    if [ -f "config/nginx-games.conf" ]; then
        cp "config/nginx-games.conf" "$BUILD_DIR/config/"
    fi
fi

# 6. 复制组件文件
echo -e "${YELLOW}复制组件文件...${NC}"
if [ -d "components" ]; then
    mkdir -p "$BUILD_DIR/components"
    for component_file in components/*.html; do
        if [ -f "$component_file" ]; then
            if [ "$MINIFY" = true ]; then
                npx html-minifier \
                    --collapse-whitespace \
                    --remove-comments \
                    --minify-css true \
                    --minify-js true \
                    "$component_file" -o "$BUILD_DIR/$component_file"
            else
                cp "$component_file" "$BUILD_DIR/$component_file"
            fi
        fi
    done
fi

# 7. 复制资源文件
echo -e "${YELLOW}复制资源文件...${NC}"
if [ -d "assets" ]; then
    cp -r assets "$BUILD_DIR/"
fi

# 8. 复制子项目（如果需要）
echo -e "${YELLOW}复制子项目...${NC}"
for subdir in PlayableAds-*; do
    if [ -d "$subdir" ] && [ "$subdir" != "$BUILD_DIR" ]; then
        echo "  复制: $subdir"
        cp -r "$subdir" "$BUILD_DIR/"
    fi
done

# 9. 创建部署信息文件
echo -e "${YELLOW}创建部署信息...${NC}"
cat > "$BUILD_DIR/build-info.txt" << EOF
构建时间: $(date '+%Y-%m-%d %H:%M:%S')
Git提交: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
Git分支: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
构建模式: $([ "$MINIFY" = true ] && echo "生产模式(压缩)" || echo "开发模式(未压缩)")
EOF

echo -e "${GREEN}✅ 构建完成！输出目录: $BUILD_DIR${NC}"

# 10. 部署到nginx（如果指定）
if [ "$DEPLOY" = true ]; then
    echo -e "${YELLOW}部署到nginx目录: $NGINX_DIR${NC}"
    
    # 检查目录是否存在
    if [ ! -d "$NGINX_DIR" ]; then
        echo -e "${RED}错误: nginx目录不存在: $NGINX_DIR${NC}"
        echo -e "${YELLOW}请先创建目录或使用 --nginx-dir 指定正确的路径${NC}"
        exit 1
    fi
    
    # 备份现有文件（如果存在）
    if [ -d "$NGINX_DIR" ] && [ "$(ls -A $NGINX_DIR 2>/dev/null)" ]; then
        BACKUP_DIR="${NGINX_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}备份现有文件到: $BACKUP_DIR${NC}"
        cp -r "$NGINX_DIR" "$BACKUP_DIR"
    fi
    
    # 复制文件到nginx目录
    echo -e "${YELLOW}复制文件到nginx目录...${NC}"
    SOURCE_DIR="$BUILD_DIR"
    if [ -d "$PROJECT_NAME" ] && [ ! -d "$BUILD_DIR" ]; then
        # 如果已经重命名了，使用重命名后的目录
        SOURCE_DIR="$PROJECT_NAME"
    fi
    rsync -av --delete \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        "$SOURCE_DIR/" "$NGINX_DIR/"
    
    # 设置正确的权限
    chmod -R 755 "$NGINX_DIR"
    
    # 重新加载nginx
    echo -e "${YELLOW}重新加载nginx配置...${NC}"
    if command -v nginx &> /dev/null; then
        if sudo nginx -t 2>/dev/null; then
            sudo nginx -s reload
            echo -e "${GREEN}✅ nginx已重新加载${NC}"
        else
            echo -e "${RED}警告: nginx配置测试失败，请手动检查${NC}"
        fi
    else
        echo -e "${YELLOW}警告: 未找到nginx命令，请手动重新加载nginx${NC}"
    fi
    
    echo -e "${GREEN}✅ 部署完成！${NC}"
else
    # 11. 打包为压缩文件（如果未部署）
    if [ "$PACKAGE" = true ]; then
        echo -e "${YELLOW}打包构建文件...${NC}"
        
        # 重命名dist目录为项目名
        if [ -d "$PROJECT_NAME" ]; then
            echo -e "${YELLOW}删除旧的 $PROJECT_NAME 目录...${NC}"
            rm -rf "$PROJECT_NAME"
        fi
        
        mv "$BUILD_DIR" "$PROJECT_NAME"
        echo -e "${YELLOW}已重命名: $BUILD_DIR -> $PROJECT_NAME${NC}"
        
        # 创建压缩包
        PACKAGE_NAME="${PROJECT_NAME}-$(date +%Y%m%d_%H%M%S).zip"
        echo -e "${YELLOW}创建压缩包: $PACKAGE_NAME${NC}"
        
        if command -v zip &> /dev/null; then
            zip -r "$PACKAGE_NAME" "$PROJECT_NAME" -q
            echo -e "${GREEN}✅ 压缩包已创建: $PACKAGE_NAME${NC}"
            
            # 显示文件大小
            FILE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
            echo -e "${GREEN}   文件大小: $FILE_SIZE${NC}"
            
            # 删除原目录（压缩包已包含所有内容）
            echo -e "${YELLOW}删除原目录: $PROJECT_NAME${NC}"
            rm -rf "$PROJECT_NAME"
            echo -e "${GREEN}✅ 原目录已删除${NC}"
        else
            echo -e "${RED}警告: 未找到zip命令，跳过压缩${NC}"
            echo -e "${YELLOW}可以使用以下命令手动压缩:${NC}"
            echo "  zip -r ${PROJECT_NAME}.zip $PROJECT_NAME"
        fi
    fi
fi

# 显示构建信息
echo ""
echo -e "${GREEN}构建信息:${NC}"
INFO_FILE="$BUILD_DIR/build-info.txt"
if [ "$PACKAGE" = true ] && [ "$DEPLOY" = false ] && [ -d "$PROJECT_NAME" ]; then
    INFO_FILE="$PROJECT_NAME/build-info.txt"
fi
# 如果目录已删除，尝试从压缩包中读取（如果可能）
if [ ! -f "$INFO_FILE" ] && [ -f "$PACKAGE_NAME" ]; then
    INFO_FILE=""
fi
if [ -f "$INFO_FILE" ]; then
    cat "$INFO_FILE"
else
    echo "构建时间: $(date '+%Y-%m-%d %H:%M:%S')"
    if [ -f "$PACKAGE_NAME" ]; then
        echo "Git提交: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")"
        echo "Git分支: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")"
        echo "构建模式: $([ "$MINIFY" = true ] && echo "生产模式(压缩)" || echo "开发模式(未压缩)")"
    fi
fi
echo ""

# 显示输出信息
if [ "$PACKAGE" = true ] && [ "$DEPLOY" = false ]; then
    echo -e "${GREEN}📦 打包文件:${NC}"
    if [ -f "$PACKAGE_NAME" ]; then
        echo -e "   ${GREEN}✅ $PACKAGE_NAME${NC}"
        if [ -d "$PROJECT_NAME" ]; then
            echo -e "   ${GREEN}✅ $PROJECT_NAME/ (目录)${NC}"
        fi
    elif [ -d "$PROJECT_NAME" ]; then
        echo -e "   ${GREEN}✅ $PROJECT_NAME/ (目录)${NC}"
    fi
    echo ""
    if [ -f "$PACKAGE_NAME" ]; then
        echo -e "${YELLOW}💡 提示: 可以上传 $PACKAGE_NAME 到服务器并解压${NC}"
    fi
elif [ "$DEPLOY" = true ]; then
    echo -e "${GREEN}📦 已部署到: $NGINX_DIR${NC}"
else
    echo -e "${GREEN}📦 构建输出: $BUILD_DIR/${NC}"
fi
echo ""

