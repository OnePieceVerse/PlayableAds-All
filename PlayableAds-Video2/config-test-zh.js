window.PLAYABLE_CONFIG = {
  "lang": "en",
  "videoUrl": "jcc-prod2.mp4",
  "rotateTime": 0,
  "start_screen": {
    "landscape": {
      "image": "start_landscape.png",
      "size": {
        "width": 1
      },
      "position": {
        "x": 0.5,
        "y": 0.5
      }
    },
    "portrait": {
      "image": "start_portrait.png",
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
      "time": 0.6,
      "duration": 3,
      "buttonImage": "start_button2.png",
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
    "buttonImage": "cta_start_button2.png",
    "buttonSize": {
      "landscape": {
        "width": 0.15,
      },
      "portrait": {
        "width": 0.4,
      }
    },
    "buttonPosition": {
      "landscape": {
        "x": 0.1,
        "y": 0.9
      },
      "portrait": {
        "x": 0.27,
        "y": 1.25
      }
    },
    "url": "https://apps.apple.com/th/app/tft-teamfight-tactics/id1480616748?l=th"
  },
  "cta_end_button": {
    "displayTime": 20,
    "buttonImage": "cta_start_button2.png",
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