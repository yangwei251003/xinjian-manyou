# 心间漫游内容契约（3.0补充）

只保留有助于内容一致性、科学可靠性与便捷扩展的约定。

## 课程

基础字段沿用1.0：`id, zone, title, question, summary, duration, tags, panels, takeaway, explanation, quiz, tryThis, boundary, evidenceLabel, sources, related`。

- `panels`：6个故事节点，每项含 `speaker, dialogue, caption, visual`。先写冲突和变化，再画对应行动；避免所有格子都在讲道理。角色、台词与实际图片要能互相对应。
- `branch`：主要分支 ID；`branches`：交叉分支 ID 数组。
- `scenes`：生活场景 ID 数组；`experimentIds`：研究档案 ID 数组。
- `prediction`：`question` 与 `options:[{text,feedback}]`。预测允许多种直觉，不把选择包装成人格结果。
- `mechanism`：`steps:string[]` 和 `metaphorLimit:string`。图形步骤是教学解释，不自动表示已证明的因果链。
- `misconception`：`myth` 与 `correction`。
- `practice`：`prompt, steps:string[], example`。只给离线可尝试的小行动，不收集真实隐私。
- `evidence`：`level, claim, limits`。等级对应具体观点，不宣布整位作者或整本书“已验证”。
- `learningGoals`：学习目标文本数组，用于后续策展与教学，不等于达标认证。

可点击演示、机制模拟与经典研究解读分别命名；不适宜儿童或不合伦理的研究不要求亲自复刻。临床主题以支持、求助和边界为主，不做诊断。

## 索引

`catalog.json` 含：
- `branches:[{id,name,description}]`
- `scenes:[{id,name,description}]`
- `experiments:[{id,name,type,lessonIds,question,procedure,finding,limits,source:{title,url}}]`

`library.json` 保留 books 与 people。书籍须有 audience（青少年延伸/学习方法/共同讨论/进阶阅读/教师与进阶/成人延伸）、具体观点和阅读边界。人物“导读”不得写成伪造原话。

## 美术：独立分格大图

每个故事六格，每格单独生成。运行文件 `assets/panels/<id>/01.webp` 至 `06.webp`，完整图像优先1536×1024或更大；不允许把整页裁切后冒称逐格生成。

`assets/media.json` 中 `media[id].panels` 为六项有序数组。可直接写图片相对路径，表示对白气泡已经在原图中。也可写 `{image,textMode:'overlay',bubbles:[{text,speaker,x,y,w}]}`，其中 x/y/w 是图内百分比坐标，用于在预留区域排准确中文。每课首格同时用作缩略封面。

正文单列展示完整图像，点击进入大图查看。文字稿以折叠方式保留，用于辅助阅读与搜索。新课的准确对白使用图内网页气泡叠层。最终验证按发布清单检查全部独立路径、尺寸和图片哈希。3.0包含28课、168张漫画。

## 逐课短片

制作源为 production/films.json，每条以稳定课程ID关联主题图形、双语字幕、六段镜头时间和76BPM节拍。同步读取已存在的成片，生成 media[id].video 对象，包含 src、poster、meta、title 和 duration。资源采用相对路径。

每课 assets/videos/<id>/ 含 film.mp4、poster.webp、script.json、zh.vtt 和 en.vtt。script.json的 cues 使用 start、end、zh、en、visual，sources对应课程来源。字幕时间连续覆盖全片。

播放由用户明确点击开始，离开课页会停止并释放媒体。文字稿可以单独读取。播放失败保留漫画、文字稿和重试。窄屏同步字幕至少16像素。

content/release.json声明发布课程清单。默认验证要求每一发布课都具备漫画与视频。--draft 只用于制作中的局部检查。

## 轻量复查

确认来源支持实际文案、故事没有替读者下诊断、图文对应、迁移问题不是死记术语、所有路径可打开、窄屏按序可读、交互可重复与重置。最后运行工程检查，记录未做过的验证，不冒称真实用户或专业评审。
