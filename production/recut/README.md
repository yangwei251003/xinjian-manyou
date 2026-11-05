# 音乐重剪版生成工程

本轮按用户的新要求直接生成影片，不要求接入OpenFilm或保留逐层手动编辑。原网站仍保留原已发布影片；使用附件配乐的新影片作为本地版本交付。本目录保存可复核的生成方法，不包含附件音乐、参考视频原片或新成片。

旧片完整MP4本来就是浏览器直接导出，OpenFilm并非一次必经转码。此前主要问题是有效镜头、机制动作和素材使用不足，以及未使用指定音乐。要求每层都在工作台可编辑会增加适配成本，但不能把上述问题归咎于工作台。

本轮每课42个有明确时间范围的镜头记录，逐课补写连接句，六格漫画各在一个叙事位置出现。28种知识另有对应机制动作，例如记忆碎片重组、框架中的100个同分母对象、抽样中被漏掉的人、信效度中的稳定读数与用途对照。背景粒子是氛围，不能替代主画面的信息推进。数字42是本轮安排，不是未来作品必须达到的数量。

## 本机运行

1. 本目录安装锁定版本的Playwright：`npm install`。需要Chrome、Python、FFmpeg及GitHub CLI；Python依赖见requirements.txt。
2. 设置`XINJIAN_AUDIO`为用户提供的AAC绝对路径。`XINJIAN_SITE`可选，默认本仓库。运行`python prepare.py`及`python build.py`。准备过程会在被忽略的assets目录复制音乐和漫画，分析音轨并生成字体子集。本机字体库位于Documents/VideoCreation/Resources/Fonts；新环境应提供同许可字体后再运行准备脚本。
3. 从本目录执行`node ../../scripts/serve.mjs`，打开本地服务的index.html。它是生成预览；完成后的普通播放器为watch.html。
4. `node export.mjs --ids knowledge-curse --workers 1`导出完整一课。可用`--seconds 16`作内部试段。`--chrome`、`--ffmpeg`、`--ffprobe`及`--playwright`可指定本机程序或模块的绝对路径。
5. 全部导出后运行`python verify.py --decode`核对MP4、完整解码和原音轨一致性。核查输出不代表已经连续看听，也不代表完成审美或教育效果验收。

动画按纯时间函数render(t)生成，字体与图片在逐帧导出前加载。切换时间来自附件的频谱起音分析并量化到60fps，约75.24BPM是分析结果，人工听审仍需单独记录。完整音频约135.19秒，AAC直接封装到MP4，不换曲、不变速、不混入口播。

## 实际参考与许可

- 本机公开科技风包kinetic-tech-zh-0.2.7-open-beta.motion：读取源代码后适配入场、描线和单次粒子爆发的曲线。对应MIT许可在reference/kinetic-tech/licenses。没有把完整模板原样充当本片。
- [Vincent video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft/tree/43bd349a136651865ecfa6ea1cf012f6e957d304)：适配OrbFlylineRelay的到达触发时序与弧线，查阅CircleMatchIris。保留Apache-2.0许可。
- [GLTransitions](https://github.com/gl-transitions/gl-transitions/tree/0efa1651dfdbc0cdbd57f4cda55f12d8b3dbc0c5)：实际编译DirectionalWipe、CircleOpen、Doorway及CrossZoom四份GLSL，保留各源码MIT声明。缩放只安排在少数关键转折。
- [MotionGit发光玻璃板](https://motiongit.com/adunext/knowledge-explainer-lightboard)与[生长导图](https://motiongit.com/adunext/knowledge-explainer-mindmap)：查阅公开说明，参考信息对应与顺序生长的方法；没有取得或运行其完整登录包。
- FilmSans来自Noto Sans SC子集，数字标题使用Anton，字体许可见assets。不将字体或第三方代码改称原创。

来源与固定版本散列见reference/sources.json。模板、网页代码、原创漫画的许可不能覆盖附件音乐。其公开同步与分发许可未核验，因此本次公开归档只包含自有生成工程与许可允许的参考代码。

## 验收边界

技术检查、抽帧通览、连续看审、全程听审、专业审读和目标年龄读者测试分别记录。不能用“42个镜头记录”直接证明观感丰富，也不能用技术通过代替90分优秀验收。用户对旧片观感的否定已经成为本次返修依据，旧工程检查分数不能证明旧影片审美达标。
