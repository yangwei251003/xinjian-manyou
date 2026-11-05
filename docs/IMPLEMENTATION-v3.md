# 心间漫游 3.0 实施记录

更新于 2026-11-05。实际工程根为当前文件上两级。上一轮评审与本轮实施属于同一任务。

## 已落实与读回

- 动态路由复用 `eb338c0f-ae4d-4ae1-92df-5719dfdf7c4a`，已查询 implementation 能力。采用原生本地工程、浏览器和内置 imagegen。没有按路由名称盲装插件。
- 原始 24 课保留 ID 和浏览器书架键。新增四课位于 lessons-c.json，合并后 28 课。增加六个研究档案，现有课补 Stroop、属性框架和延迟提取来源。
- 已用内置 imagegen 分别生成 24 张独立漫画，PNG 原件保留在工作台项目根 comic-originals，WebP 位于网站 assets/panels。图内对白是可编辑网页叠层。production/comics.json 记录每格提示词与生成文件名。
- 搜索包含中文目录、正文与术语别名，收藏过滤组合已修复。窄屏显示继续探索。生活任务与证据边界的重复展示已压缩。
- 28 支独立双语脚本，每支 75.789 秒、1920×1080、60fps，76BPM 原创合成配乐。28 个不同的机制图 motif。production/films.json 是脚本源。
- 网站播放器按需载入 MP4，同步双语阅读条，分镜文字稿可展开，媒体错误可重试。保留旧版无视频课程的阅读能力。
- 25 项自动测试和 28 课程/10 系统页模拟渲染已通过。168 张独立图和28支最终视频的发布完整性检查通过。

## 本机工作台与渲染

- 可编辑工程根为 Documents/VideoCreation/Projects/xinjian-manyou-v3，每课一个子目录。film.html 有六个主画面剪辑、独立音乐、五个与场景 Link 的动作音效，字幕在 pages/episode.html 的独立 DOM。
- build.py 生成前核对 .director-source-sha256，发现手改会停止。独立网页含字体和全部动画，暴露 render(t) 和 OpenFilm 协议 frame(t)。
- attention 已在 OpenFilm Studio 后台实际打开，时间线可见 3 轨/12 片段。原生 CLI 实际导出 3 秒、180 帧、1920×1080、60fps，h264_amf。30fps 是 Studio 初始默认时间码设置，成片导出明确 60fps。
- 全28支完整MP4完成第二轮实际编码、ffprobe读回与全流解码。每支4548帧、60/1、75.8秒，H.264+48kHz AAC。Canvas+WebCodecs从显式帧时间求值，FFmpeg封装并faststart。每片生活段纳入各课独立漫画。
- 全28个最终工程均完成生活段58至59秒原生60fps导出。感恩记录在OpenFilm Studio后台实测选中标题、编辑保存、撤销并恢复基线。手改保护也用实际临时修改验证。
- 生成音轨为原创合成，音乐、动作音效和混音分轨保留。附件 AAC 用作私人节奏参考，未用于公开成片。
- 五条指定抖音原片均已通过公开无登录入口取得，完成全音轨 ASR（无语音段）和 16 帧/片的 OCR。研究原件和截图仅留在 Documents/VideoCreation/Projects/xinjian-manyou-v3-research，禁止上传。

## 最终检查与保留项

- requireVideo=true的发布检查通过，索引中28课均有影片。两处漫画修订已读回，390像素屏宽新漫画对白至少16像素。
- 全28支六个关键时刻的最终画面已查看。28页排版、字体就绪和两类画面随机时间求值通过容差检查。
- 1366与390像素真实无头Chrome走完28课，两轮56次播放、暂停、拖动、字幕、失败重试及发现入口检查均通过。
- 暂评88／100，沿用原权重。完整连续看听、导演量表90分、专业审读与真实儿童学习效果保留待验证，详见QA-v3.md。
- Public归档目标为yangwei251003/xinjian-manyou。研究原片、完整转写、用户AAC和工作台缓存保存在站点外。

## 运行命令

`npm run sync`、`npm run check`、`npm test`、`npm run validate`。发布前最后一项必须包含28支视频。

制作从 `python production/build.py`、`python production/score.py` 开始。帧导出为 `node production/render.mjs --playwright <已安装playwright入口> --workers 2`。外部依赖仅用于制作，运行静态网站不需要它们。保留私人原片、缓存、原始无损音频于站点外部。
