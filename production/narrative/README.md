# 心间漫游 · 叙事重制工程

14支串联短片，覆盖28个心理学知识点。视频与漫画分别组织。最终脚本在 scripts.json 和连续讲述稿.md；先确定连续解释，再由 storyboards.py 绑定图形，build.py 按阅读时间和附件实际节拍分配时长。每片24段是本次脚本的结果，不是未来视频的固定镜头规范。

OpenFilm已永久退出本工作流程；不安装、不启动、不连接，不以可编辑工作台为前提。旧工作台资料仅供历史追溯。render(t)由绝对时间决定画面，Canvas+WebGL直接输出MP4。

## 实际采用的参考

- kinetic-tech-zh 0.2.7公开测试包：查阅B1标题入场、B3比较布局和时序，适配成Canvas动作。MIT。
- Vincent OrbFlylineRelay：单次传递、到达再强调的编排，Apache-2.0。
- GL Transitions：实际编译运行 DirectionalWipe、CircleOpen、CrossZoom，MIT。
- MotionGit生长导图：仅公开方法参考，没有声称下载或运行完整包。

精确来源与使用范围见reference/usage.json，许可随源码保留。视频没有使用漫画图或外部视频镜头。字体是OFL许可子集。

## 运行与渲染

需要Python、fontTools/Brotli、Node.js22+、Chrome、Playwright和FFmpeg。将用户AAC放入assets/user-music.aac；它不随公共仓库分发。export.mjs中的本机工具路径需对应实际安装位置。

1. python build.py
2. 用支持本地HTTP的服务打开index.html，在配乐时间轴预览。
3. node export.mjs --workers 2
4. python verify.py --decode
5. python assemble-site.py

assemble-site.py用于本机已有平台目录的独立发行版组装。网站只依赖生成的静态文件和本地服务，不需要任何制作工作台。films.html为14片目录；assets/media.json把28课明确映射到14片，并保留逐课事实表。可移植运行包中的START_WINDOWS.bat会打开目录。

本地影片保留用户原始AAC音频包；公开同步和分发授权未核验，因此本仓库归档源码与许可允许的素材，不含附件或新MP4。公开Pages媒体仍是旧版，不能将其当作本轮成片预览。

脚本已进行独立逻辑与来源复核。技术检查、关键帧通览不等于全部影片连续主观看听或儿童学习效果验证，不给出无证据的优秀分数。
