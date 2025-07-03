// 素材配置文件
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
        totalFrames: 23
    },
    obstacleTop: {
        key: "obstacleTop",
        path: `./assets/${theme}/obstacle-top.png`,
        desc: "顶部障碍物"
    },
    obstacleBottom: {
        key: "obstacleBottom",
        path: `./assets/${theme}/obstacle-bottom.png`,
        desc: "底部障碍物"
    },
    bomb: {
        key: "bomb",
        path: `./assets/${theme}/bomb.png`,
        desc: "炸弹"
    },
    clickSound: {
        key: "clickSound",
        path: `./assets/${theme}/click.mp3`,
        desc: "点击音效"
    },
    loseSound: {
        key: "loseSound",
        path: `./assets/${theme}/lose.mp3`,
        desc: "游戏失败音效"
    }
};

export default themeConfig; 