window.PLAYABLE_CONFIG = {
  "lang": "zh",
  "videoUrl": "jcc-prod.mp4",
  "rotateTime": 1.4,
  "interactionPoints": [
    {
      "time": 2,
      "duration": 3,
      "buttonImage": "start_button.png",
      "buttonEffect": "scale",
      "buttonSize": {
        "landscape": {
          "width": 0.3
        },
        "portrait": {
          "width": 0.8
        }
      },
      "buttonPosition": {
        "landscape": {
          "x": 0.5,
          "y": 0.73
        },
        "portrait": {
          "x": 0.5,
          "y": 0.9
        }
      },
      "guideImage": "guide.png",
      "guideSize": {
        "landscape": {
          "width": 0.1
        },
        "portrait": {
          "width": 0.3
        }
      },
      "guidePosition": {
        "landscape": {
          "x": 0.56,
          "y": 0.72
        },
        "portrait": {
          "x": 0.53,
          "y": 0.88  // 调整引导图位置
        }
      },
      "swipeDirection": "slide-bounce"
    },
  ],
  "cta_start_button": {
    "displayTime": 1.4,
    "buttonImage": "cta_start_button.png",
    "buttonSize": {
      "landscape": {
        "width": 0.15,
      },
      "portrait": {
        "width": 0.4,  // 增加竖屏模式下的按钮大小
      }
    },
    "buttonPosition": {
      "landscape": {
        "x": 0.1,
        "y": 0.9
      },
      "portrait": {
        "x": 0.31,  // 修正竖屏模式下的x坐标，确保按钮可见
        "y": 1.25
      }
    },
    "url": "https://apps.apple.com/th/app/tft-teamfight-tactics/id1480616748?l=th"
  },
  "cta_end_button": {
    "displayTime": 21,
    "buttonImage": "cta_end_button.png",
    "buttonSize": {
      "landscape": {
        "width": 0.3,
      },
      "portrait": {
        "width": 0.8,
      }
    },
    "buttonPosition": {
      "landscape": {
        "x": 0.36,
        "y": 0.69
      },
      "portrait": {
        "x": 0.45,
        "y": 0.8
      }
    },
    "url": "https://apps.apple.com/th/app/tft-teamfight-tactics/id1480616748?l=th"
  }
};