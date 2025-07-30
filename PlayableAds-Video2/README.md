[TOC]

## 常用命令
1. 调整视频音量，移动端不能通过代码来调整音量，大多只支持 0/1，甚至直接忽略 volume 设置。
```
ffmpeg -i jcc-prod-v3-c2.mp4 -vcodec copy -af "volume=0.05" jcc-prod-v3-c2-vol5.mp4
```
