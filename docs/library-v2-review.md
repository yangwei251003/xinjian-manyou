# 书籍与人物小展签：v2 内容复核

更新日期：2026-11-01。

## 已完成

- 从 9 本书、8 组人物深化为 **11 本书、10 组人物**。
- 每本书增加问题入口、核心想法、原创小练习、历史背景、阅读提示、材料类型与来源。
- 每组人物增加问题入口、核心想法、历史背景、证据/思想史类型、常见误读、原创观察任务与来源。
- 保持 `books` / `people` 数组及原字段兼容，保留课程链接；新增人物稳定 `id`。
- 新增 Quiet Power：出版社英文版年龄标注 10 岁以上，场景面向学校、家庭与友谊。这不代表全部 10 岁读者都有相同英文阅读能力。
- 新增 Psychology 2e：作为免费系统查阅入口，明确是大学入门教材，不要求低龄学生独立读完。
- 新增安斯沃思与罗迪格：补上依恋研究源流和学习科学的连接。
- 修正斯特鲁普姓名为约翰·里德利·斯特鲁普（J. Ridley Stroop）。

## 年龄分层与科学边界

`audience` 用于前端分组，不能只把提示藏在长段落里：

- 学习方法 / 青少年延伸 / 共同讨论：适合优先发现。
- 进阶阅读 / 教师与进阶：可选更深材料。
- 成人延伸：Attached、Man's Search for Meaning、The Body Keeps the Score。应单列折叠区域，不进入学生默认推荐路径。

附有创伤案例的书只介绍其材料性质与延伸边界，不呈现案例、不要求分享个人经历，不安排创伤回忆或自行治疗任务。对依恋区分幼儿研究程序与成人关系通俗分类，不鼓励给同学贴类型标签。安斯沃思展签明确不自行制造分离压力测试孩子。

本轮没有添加书中长引文、网络名言或声称心理学家的原话。`hook` / `coreIdea` / `tryIt` 全部为本站原创导读与任务设计，不是作者原文。没有复制封面、出版社插图或历史照片。出版社/作者页面可核对作品与作者主张，但不是独立疗效证据。每本书的 `status` 是材料类型提示，而非对整本书的统一科学评分。

## 来源核验记录

以下链接经本轮网络检索或打开核对；这里只转述与展签直接相关的少量内容。页面营销用语、销量、疗效保证不进入展签。

### 书籍

1. [Thinking, Fast and Slow，Macmillan](https://us.macmillan.com/books/9780374275631/thinkingfastandslow/)：作者、判断与选择主题、双系统作为解释性角色隐喻。打开成功。
2. [Influence，作者官网](https://cialdini.com/books/influence)：原版六原则与扩展版新增原则；说服线索的主题。打开成功。
3. [Make It Stick，官方书站](https://www.makeitstick.com/)：三位作者、提取练习与间隔学习主题。打开成功；未采用营销式绝对化措辞。
4. [Quiet，出版社](https://www.penguinrandomhouse.com/books/22821/quiet-by-susan-cain/9780307352149/)：书目与人格差异主题。打开成功。
5. [Attached，出版社](https://www.penguinrandomhouse.com/books/303069/attached-by-amir-levine-md-and-rachel-sf-heller-ma/9780593171660/)：作者及成人亲密关系定位。打开成功。
6. [The Courage to Be Disliked，出版社](https://www.simonandschuster.com/books/The-Courage-to-Be-Disliked/Ichiro-Kishimi/9781501197277)：两位作者、对话体及阿德勒思想演绎。打开成功；未采用“否认创伤”作为本站结论。
7. [Man's Search for Meaning，Beacon 教师指南](https://www.beacon.org/Assets/ClientPages/MansSearchForMeaningtg.aspx)：回忆叙事与意义治疗部分的区分、重大苦难背景；指南把青少年版用于较高年级高中，不据此推为儿童读物。打开成功。
8. [How Emotions Are Made，作者官网](https://lisafeldmanbarrett.com/books/how-emotions-are-made/)：作者理论定位与原文书名。打开成功。与人物展签共享来源，不算独立两份证据。
9. [The Body Keeps the Score，出版社](https://www.penguinrandomhouse.com/books/313183/the-body-keeps-the-score-by-bessel-van-der-kolk-md/)：创伤主题、临床案例性质。打开成功；未转述治疗效果保证。
10. [Quiet Power，出版社](https://www.penguinrandomhouse.com/books/314363/quiet-power-by-susan-cain-with-gregory-mone-and-erica-moroz-illustrated-by-grant-snider/) 与[作者介绍](https://susancain.net/book/quiet-power/)：出版社年龄 10+、年轻读者生活场景。检索返回官方正文。
11. [Psychology 2e，OpenStax 前言](https://openstax.org/books/psychology-2e/pages/preface)：免费入门教材与学科范围。打开成功。

### 人物与原始材料

- [Kahneman & Tversky，Prospect Theory 原始论文](https://www.ucl.ac.uk/anaesthesia/sites/anaesthesia/files/kahneman-tversky.pdf)：原始论文题名、作者与决策模型；本轮检索确认。诺奖官网直接访问部分失败，展签主要链接可追溯原始论文而不使用未经读取的新事实。
- [Loftus，UCI 论文目录](https://faculty.sites.uci.edu/eloftus/publications/)：直接打开一度 502；官方检索正文可确认误导信息研究。没有声称逐篇通读目录内论文。
- [Stroop，1935 原始论文](https://psychclassics.yorku.ca/Stroop/)：打开成功，原题 Studies of Interference in Serial Verbal Reactions。
- [Bandura, Ross & Ross，1961 原始论文](https://www.yorku.ca/pclassic/Bandura/bobo.htm)：打开成功，共同作者与玩偶模仿情境已核对。
- [Piaget，日内瓦大学理论资料](https://tecfa.unige.ch/themes/sa2/act-app-dos2-fic-genetic.htm)：官方检索正文确认知识发展主题。Centre Piaget 首页显示 Access Denied，不绕过访问限制；本次使用另一公开大学教学资料，未下载受限内容。
- [Vygotsky，MIT Press 原著介绍](https://mitpress.mit.edu/9780262304917/thought-and-language/)：打开成功，语言/思维主题、1934 年身后出版与译本说明。
- [Freud，美国国会图书馆档案](https://www.loc.gov/collections/sigmund-freud-papers/about-this-collection/)：直接打开 403，官方检索正文包含档案类型与精神分析发展史说明；未声称检阅单份手稿。
- [Ainsworth，华盛顿大学 I-LABS](https://modules.ilabs.uw.edu/module/attachment-in-practice/measuring-attachment-strange-situation/)：官方检索正文确认幼儿照料关系观察程序；直接打开超时。展签不安排复刻测试。
- [Roediger，华盛顿大学圣路易斯校区](https://psych.washu.edu/people/henry-roediger) 与[Roediger & Butler 综述](https://psychnet.wustl.edu/memory/wp-content/uploads/2018/04/Roediger-Butler-2011_TCS.pdf)：官方检索正文确认记忆、提取练习与反馈主题。

## 验证范围

本轮做了来源核对、原创文本与年龄边界复查、JSON 解析、重复 ID 与课程链接检查。没有进行真实儿童阅读测试、完整学术同行评审或所有外部链接的多地区可用性测试。页面内容与网络可达性将来可能改变。
