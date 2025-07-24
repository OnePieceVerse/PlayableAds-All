window.PLAYABLE_CONFIG = {
  "lang": "en",
  "videoUrl": "jcc-prod-v3-c2.mp4",
  "rotateTime": 0,
  "start_screen": {
    "enable": true,
    "landscape": {
      "image": "start_landscape2.webp",
      "size": {
        "width": 1
      },
      "position": {
        "x": 0.5,
        "y": 0.5
      }
    },
    "portrait": {
      "image": "start_portrait2.webp",
      "size": {
        "width": 1
      },
      "position": {
        "x": 0.5,
        "y": 0.5
      }
    }
  },
  "interactionPoints": [
    {
      "time": 0.2,
      "duration": 3,
      "buttonImage": "start_button2.png",
      "buttonEffect": "scale",
      "buttonSize": {
        "landscape": {
          "width": 0.22
        },
        "portrait": {
          "width": 0.65
        }
      },
      "buttonPosition": {
        "landscape": {
          "x": 0.39,
          "y": 0.68
        },
        "portrait": {
          "x": 0.44,
          "y": 0.8
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
    "displayTime": 0.2,
    "buttonImage": "cta_start_button3.png",
    "buttonSize": {
      "landscape": {
        "width": 0.1,
      },
      "portrait": {
        "width": 0.3,
      }
    },
    "buttonPosition": {
      "landscape": {
        "x": 0.08,
        "y": 0.90
      },
      "portrait": {
        "x": 0.26,
        "y": 1.21
      }
    },
    "url": "https://apps.apple.com/th/app/tft-teamfight-tactics/id1480616748?l=th"
  },
  "cta_end_button": {
    "displayTime": 20,
    "buttonImage": "cta_start_button3.png",
    "buttonSize": {
      "landscape": {
        "width": 0.2,
      },
      "portrait": {
        "width": 0.6,
      }
    },
    "buttonPosition": {
      "landscape": {
        "x": 0.41,
        "y": 0.69
      },
      "portrait": {
        "x": 0.47,
        "y": 0.8
      }
    },
    "url": "https://apps.apple.com/th/app/tft-teamfight-tactics/id1480616748?l=th"
  }
};