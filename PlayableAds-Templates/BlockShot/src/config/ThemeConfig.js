const theme = "demo";

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

export default themeConfig; 