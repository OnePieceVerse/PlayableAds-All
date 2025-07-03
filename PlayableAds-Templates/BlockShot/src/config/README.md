# 主题素材配置使用说明

## 添加新主题

1. 在 `../assets/` 目录下创建新的主题文件夹，例如 `assets/MyNewTheme/`
2. 在新主题文件夹中放入以下素材文件：
   - `background.png` - 游戏背景
   - `player.png` - 玩家静态图
   - `block.png` - 方块
   - `bullet.png` - 子弹
   - `fire.png` - 狂暴射击
   - `block-break.mp3` - 方块破碎音效
   - `special-buff.mp3` - 特殊buff音效
   - `lose.mp3` - 游戏失败音效

3. 修改 `ThemeConfig.js` 文件：
   - 修改文件顶部的 `theme` 变量值为你的新主题文件夹名

## 切换主题

- 修改文件顶部的 `theme` 变量值为你的新主题文件夹名

## 示例配置

```javascript
// 修改主题
const theme = "MyNewTheme";

export const themeConfig = {
    theme: theme,
    background: {
        key: "background",
        path: `./assets/${theme}/background.png`,
        desc: "游戏背景"
    },
    player: {
        key: "player",
        path: `./assets/${theme}/player.png`,
        desc: "玩家静态图",
        width: 400,
        height: 400
    },
    block: {
        key: "block",
        path: `./assets/${theme}/block.png`,
        desc: "方块"
    },
    bullet: {
        key: "bullet",
        path: `./assets/${theme}/bullet.png`,
        desc: "子弹"
    },
    fire: {
        key: "fire",
        path: `./assets/${theme}/fire.png`,
        desc: "狂暴射击"
    },
    blockBreak: {
        key: "blockBreak",
        path: `./assets/${theme}/block-break.mp3`,
        desc: "方块破碎音效"
    },
    specialBuff: {
        key: "specialBuff",
        path: `./assets/${theme}/special-buff.mp3`,
        desc: "特殊buff音效"
    },
    lose: {
        key: "lose",
        path: `./assets/${theme}/lose.mp3`,
        desc: "游戏失败音效"
    }
};
```

## 注意

- 所有素材文件名需与配置一致，放在对应主题文件夹下。
- 音效文件建议为 mp3 格式。
- 为了保证素材伸缩后不出现形变，最好保证player素材的尺寸为正方形。
