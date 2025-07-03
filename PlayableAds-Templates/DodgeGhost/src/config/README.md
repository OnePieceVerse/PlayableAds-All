# 主题素材配置使用说明

## 添加新主题

1. 在 `../assets/` 目录下创建新的主题文件夹，例如 `assets/MyNewTheme/`
2. 在新主题文件夹中放入以下素材文件：
   - `background.png` - 游戏背景
   - `player.png` - 玩家静态图
   - `player-spritesheet.png` - 玩家动态精灵图（动画序列）
   - `ghost.png` - 鬼魂
   - `stealth.png` - 无敌技能图标
   - `border-row.png` - 横向边界
   - `border-column.png` - 纵向边界

3. 修改 `ThemeConfig.js` 文件：
   - 修改文件顶部的 `theme` 变量值为你的新主题文件夹名
   - 如有需要，根据新素材调整 `playerSpritesheet` 的 `frameWidth`、`frameHeight` 和 `totalFrames` 配置


## 切换主题

   - 修改文件顶部的 `theme` 变量值为你的新主题文件夹名
   - 如有需要，根据新素材调整 `playerSpritesheet` 的 `frameWidth`、`frameHeight` 和 `totalFrames` 配置


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
        desc: "玩家静态图"
    },
    playerSpritesheet: {
        key: "playerSpritesheet",
        path: `./assets/${theme}/player-spritesheet.png`,
        desc: "玩家动态精灵图",
        frameWidth: 48,    // 单帧宽度
        frameHeight: 48,   // 单帧高度
        totalFrames: 4     // 总帧数
    },
    ghost: {
        key: "ghost",
        path: `./assets/${theme}/ghost.png`,
        desc: "鬼魂"
    },
    stealth: {
        key: "stealth",
        path: `./assets/${theme}/stealth.png`,
        desc: "无敌技能图标"
    },
    borderRow: {
        key: "borderRow",
        path: `./assets/${theme}/border-row.png`,
        desc: "横向边界"
    },
    borderColumn: {
        key: "borderColumn",
        path: `./assets/${theme}/border-column.png`,
        desc: "纵向边界"
    },
        bgm: {
        key: "bgm",
        path: `./assets/${theme}/bgm.mp3`,
        desc: "背景音乐"
    },
    stealthSound: {
        key: "stealthSound",
        path: `./assets/${theme}/stealth.mp3`,
        desc: "无敌技能音效"
    },
    loseSound: {
        key: "loseSound",
        path: `./assets/${theme}/lose.mp3`,
        desc: "游戏失败音效"
    }
};
``` 

## 注意
为了保证素材伸缩后不出现形变，最好保证player、playerSpritesheet每帧、ghost素材的尺寸都为正方形，同时player和playerSpritesheet每帧的尺寸必须相同。