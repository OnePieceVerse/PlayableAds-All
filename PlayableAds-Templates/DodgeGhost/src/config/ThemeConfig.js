// const theme = "demo";
// const theme = "FlappyBird";
const theme = "TeamfightTactics";


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
    // demo
    // playerSpritesheet: {
    //     key: "playerSpritesheet",
    //     path: `./assets/${theme}/player-spritesheet.png`,
    //     desc: "玩家动态精灵图",
    //     frameWidth: 48,
    //     frameHeight: 48,
    //     totalFrames: 4
    // },
    // flappybird
    // playerSpritesheet: {
    //     key: "playerSpritesheet",
    //     path: `./assets/${theme}/player-spritesheet.png`,
    //     desc: "玩家动态精灵图",
    //     frameWidth: 1024,
    //     frameHeight: 1024,
    //     totalFrames: 2
    // },
    // teamfighttactics
    playerSpritesheet: {
        key: "playerSpritesheet",
        path: `./assets/${theme}/player-spritesheet.png`,
        desc: "玩家动态精灵图",
        frameWidth: 640,
        frameHeight: 640,
        totalFrames: 24
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

export default themeConfig; 