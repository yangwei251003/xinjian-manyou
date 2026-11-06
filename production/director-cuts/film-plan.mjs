// Dialogue and scene timings are authored for each film. Times in a shot are local.
const shot = (id, seconds, subtitles) => ({id, seconds, subtitles});

export const films = [
  {
    id: 'attention-limits', title: '球场上的第七位', style: '俯拍球场 · 观察挑战',
    color: '#174b68', subtitle: ['#0e2c40', '#fff8e8'], poster: 1.5,
    sound: 'court', shots: [
      shot('tipoff', 5, [[0, '只数蓝队把球传给队友的次数。', 'Count only passes between blue players.']]),
      shot('passing', 12, [[0, '蓝队传了几次？', 'How many passes does the blue team make?']]),
      shot('reveal', 8, [[0, '六次。球场中央还有一位撑黄伞的来客。', 'Six. A visitor with a yellow umbrella also crossed the court.'], [4.1, '如果刚才没有留意，这正是我们要观察的现象。', 'If you missed it, that is the phenomenon we are exploring.']]),
      shot('aperture', 9, [[0, '数球时，你得持续选出同一队、同一个球。', 'Counting requires repeatedly selecting the same team and ball.'], [4.4, '任务之外的东西即使在视野里，也可能没进入觉察。', 'An item outside the task can be visible and still escape awareness.']]),
      shot('study', 10, [[0, '西蒙斯和沙布里做过传球计数实验。', 'Simons and Chabris conducted a pass-counting experiment.'], [4.4, '有些观察者漏报了意外角色。刚才是重新设计的示范。', 'Some observers missed the unexpected figure. Our challenge is an original demonstration.']]),
      shot('transfer', 10, [[0, '第二遍可以换任务。把目光放到横穿球场的路线。', 'Change your task on a second look. Attend to the path across the court.'], [4.8, '注意分给什么，会改变你最后能报告什么。', 'What you attend to changes what you can report.']]),
    ],
  },
  {
    id: 'memory-calibration', title: '同一声碰撞，两种回忆', style: '胶片档案 · 证词剪接',
    color: '#b45238', subtitle: ['#332825', '#fff4d8'], poster: 2,
    sound: 'film', shots: [
      shot('collision', 8, [[0, '两辆车碰了一下。你会怎样描述刚才的速度？', 'Two cars collide. How would you describe their speed?']]),
      shot('wording', 10, [[0, '“碰到”与“猛撞”，给同一段画面配了不同的词。', '“Hit” and “smashed” put different words on the same footage.'], [5, '洛夫特斯和帕尔默发现，提问用词影响速度估计。', 'Loftus and Palmer found that wording affected speed estimates.']]),
      shot('afterweek', 12, [[0, '另一项实验里，研究者在看片一周后追问碎玻璃。', 'In a separate experiment, researchers asked about broken glass one week after viewing.'], [5.4, '片中没有碎玻璃。先前读到“猛撞”的人，更常回答看见了。', 'There was no broken glass. People who read “smashed” earlier reported seeing it more often.']]),
      shot('splice', 11, [[0, '回忆会把原线索、后来的描述和推断拼到一起。', 'Recall can combine original cues, later descriptions, and inference.'], [5, '拼得完整的感觉，本身不能证明每个细节都准确。', 'A complete-feeling memory cannot prove each detail is accurate.']]),
      shot('calibrate', 10, [[0, '元认知也包括监测自己的把握有多可靠。', 'Metacognition includes monitoring how reliable your confidence is.'], [4.7, '把“我很确定”与“记录支持”分别写下来。', 'Write down your confidence and the evidence separately.']]),
      shot('check', 10, [[0, '先独立记下你看到的，再核对当时的照片或记录。', 'Record what you saw before comparing it with a photo or record.'], [4.9, '有了核对的结果，下次才知道该给自己的把握打几折。', 'Checking gives you feedback for calibrating future confidence.']]),
    ],
  },
  {
    id: 'learning-loop', title: '把书合上以后', style: '俯视书桌 · 纸页折叠',
    color: '#bb832e', subtitle: ['#453226', '#fff8df'], poster: 2.5,
    sound: 'desk', shots: [
      shot('fold', 8, [[0, '答案摆在眼前，很容易觉得自己已经会了。', 'With the answer in sight, it is easy to feel that you know it.'], [4.3, '现在合上纸页，试着自己说出来。', 'Now fold the page shut and try to recall it.']]),
      shot('recall', 10, [[0, '先找答案，再打开核对。这就是一次提取练习。', 'Retrieve the answer before reopening the page to check it.'], [4.7, '忘了的地方圈出来，下一次只多练这个缺口。', 'Mark the missing piece and practice it again.']]),
      shot('comparison', 16, [[0, '一项实验比较了重读和回忆练习。', 'An experiment compared rereading and retrieval practice.'], [4.7, '五分钟后，重读过的文章记得更多。', 'After five minutes, reread passages were remembered better.'], [10.1, '两天或一周后，练过回忆的文章保留更多。', 'After two days or one week, recall-practiced passages were retained better.']]),
      shot('habit', 10, [[0, '把两道回忆题接在每天收书包这个固定动作后面。', 'Attach two recall questions to a regular action like packing your bag.'], [5, '稳定情境里的反复行动，有助于形成习惯。', 'Repetition in a stable context helps build a habit.']]),
      shot('night', 11, [[0, '睡眠也参与学习后的记忆巩固。', 'Sleep also participates in memory consolidation after learning.'], [4.6, '给学习留下一段正常的睡眠时间，第二天再检索一次。', 'Leave time for normal sleep, then retrieve again the next day.']]),
      shot('next-day', 10, [[0, '今天先回忆并核对，明天不看答案再试一次。', 'Recall and check today. Try again tomorrow without the answer.'], [4.8, '几天后能自己想起，比刚看过时的熟悉感更有用。', 'Being able to recall it days later is more informative than immediate familiarity.']]),
    ],
  },
  {
    id: 'emotion-context', title: '心跳没有字幕', style: '舞台灯光 · 同一身体信号',
    color: '#82427a', subtitle: ['#27162f', '#fff0e4'], poster: 1.8,
    sound: 'stage', shots: [
      shot('curtain', 8, [[0, '幕布就要打开。胸口一阵砰砰跳。', 'The curtain is about to open. Your heart is pounding.'], [4, '这是害怕，还是兴奋？', 'Is this fear, or excitement?']]),
      shot('two-scenes', 10, [[0, '上台做报告时，心跳加快可以伴随紧张。', 'A racing heart can accompany anxiety before a presentation.'], [4.7, '期待演出时，同样的信号也可以伴随兴奋。', 'The same signal can accompany excitement before a performance.']]),
      shot('pressure', 10, [[0, '当要求很高、可用时间和支持很少，压力可能升高。', 'Stress may rise when demands are high and time or support is limited.'], [5, '现场条件和身体状态，都值得一起看。', 'Look at both the situation and what your body is doing.']]),
      shot('new-reading', 11, [[0, '把“心跳快就说明我要失败”换成“我正在为上台做准备”。', 'Try reading the racing heart as preparation to go on stage.'], [5.6, '认知重评改变的是你对这次信号的解释。', 'Cognitive reappraisal changes your interpretation of the signal.']]),
      shot('move-prop', 10, [[0, '有些压力需要改现场。可以请求多一次排练，或者减少任务。', 'Some stress calls for changing the situation. Ask for rehearsal or a smaller task.'], [5.1, '换个解释和调整条件，可以同时做。', 'You can reframe the situation and change its conditions.']]),
      shot('stage-exit', 9, [[0, '下次心跳快时，先说说现在发生了什么，再决定下一步。', 'When your heart races, name the situation before choosing your next step.']]),
    ],
  },
  {
    id: 'comparison-personality', title: '把镜头拉远一点', style: '摄影画廊 · 取景框拉远',
    color: '#388575', subtitle: ['#16483d', '#f9ffea'], poster: 2.1,
    sound: 'gallery', shots: [
      shot('portrait', 8, [[0, '一张得奖照片，最先让你看见的是台上的那一秒。', 'A winning photo first shows you one moment on the podium.']]),
      shot('pullback', 11, [[0, '把镜头拉远，才看见练习、同伴和不同的起点。', 'Pull back to see practice, teammates, and different starting points.'], [5.3, '社会比较可以给你方向。比较之前，先问样本里漏了什么。', 'Social comparison can guide you. Ask what your comparison leaves out.']]),
      shot('situations', 11, [[0, '同一个人，在熟悉的小组很健谈，在陌生场合很安静。', 'One person may speak freely in a familiar group and stay quiet among strangers.'], [5.1, '单次表现既跟人的倾向有关，也跟当时的情境有关。', 'One observation can reflect both tendencies and the situation.']]),
      shot('spectrum', 10, [[0, '人格维度描述相对稳定的倾向，允许许多中间位置。', 'Trait dimensions describe relatively stable tendencies on a continuum.'], [5.6, '多看一些时候和场合里的行为，才能获得更有用的线索。', 'Behavior observed across times and settings gives more useful clues.']]),
      shot('crop', 10, [[0, '把“我比他差”换成一件能观察、能练习的事。', 'Turn a global comparison into one observable action you can practice.'], [4.8, '比如这周让自己的开场比上周更清楚。', 'For example, make this week’s opening clearer than last week’s.']]),
    ],
  },
  {
    id: 'support-exploration', title: '独立也有补给站', style: '剪纸山径 · 一次远足',
    color: '#575ea2', subtitle: ['#2c345d', '#fff4dc'], poster: 2.2,
    sound: 'trail', shots: [
      shot('trailhead', 9, [[0, '有个可以回去的补给站，你会更敢往前走吗？', 'Would a place to return to make it easier to explore?']]),
      shot('secure-base', 12, [[0, '依恋研究用“安全基地”形容照料者提供的探索后盾。', 'Attachment research calls a caregiver who supports exploration a secure base.'], [5.6, '孩子可以出发，遇到不安时回来获得安抚，再去探索。', 'A child can explore, return for comfort, and explore again.']]),
      shot('bridge', 10, [[0, '长大以后，社会支持也能提供走下一步的条件。', 'Later in life, social support can make the next step possible.'], [4.9, '陪伴、信息和实际帮忙，适用于不同的困难。', 'Companionship, information, and practical help meet different needs.']]),
      shot('ask', 11, [[0, '求助可以从一句具体的话开始。', 'Help-seeking can begin with one concrete request.'], [4.1, '“我卡在第二步了，你愿意陪我看一下吗？”', '“I’m stuck on step two. Could you look at it with me?”']]),
      shot('network', 11, [[0, '先找信任的人。困扰持续或涉及安全时，找合适的成人或专业支持。', 'Ask someone you trust. Persistent or safety-related problems can call for adult or professional support.'], [6.1, '一条路暂时走不通，还能试另外一个支持点。', 'If one route is unavailable, try another support point.']]),
      shot('lookout', 8, [[0, '别人给你一块踏板，决定怎么走的仍然是你。', 'Someone can offer a foothold while you decide how to proceed.']]),
    ],
  },
  {
    id: 'communication-gap', title: '站到他那一边', style: '机械工坊 · 视角翻转',
    color: '#75852a', subtitle: ['#293421', '#f6ffd9'], poster: 2.3,
    sound: 'workshop', shots: [
      shot('jam', 8, [[0, '师傅说“对着红标推”。新人却把滑块卡住了。', '“Push toward the red mark,” says the instructor. The learner jams the slider.'], [4.2, '你第一反应会怎么解释？', 'What is your first explanation?']]),
      shot('turntable', 11, [[0, '师傅从这一侧看，红标就在挡板前面。', 'From the instructor’s side, the red mark is in front of the shield.'], [4, '转到新人这边。红标被挡住了。', 'Turn to the learner’s side. The red mark is hidden.'], [7.4, '同一次失误，有了一个新的解释。', 'The same jam now has another possible explanation.']]),
      shot('attribution', 10, [[0, '从一次行为推断原因，叫归因。先把能看到的事实和猜测分开。', 'Attribution is explaining behavior. Separate what you observed from your guess.'], [5.6, '“滑块卡住了”是观察，“他不用心”还需要证据。', 'The jam was observed. Carelessness remains a hypothesis.']]),
      shot('hidden-key', 10, [[0, '知道红标的人，很难想象第一次看不到它的人怎么理解。', 'Knowing the mark makes it hard to imagine a first-timer’s view.'], [5.1, '把自己的知识当作共同知识，就是知识诅咒的一种表现。', 'Treating your knowledge as shared illustrates the curse of knowledge.']]),
      shot('listen', 12, [[0, '先问他看到了什么，再复述一遍自己的理解。', 'Ask what the learner saw, then paraphrase what you heard.'], [5.5, '“你只看见两个槽，所以选了离手近的那个？”', '“You could only see two slots, so you picked the nearer one?”']]),
      shot('unlock', 11, [[0, '补上共同参照。“黄点朝上，推到第一道刻线。”', 'Give a shared reference. “Yellow dot up, then push to the first line.”'], [5.3, '让对方试一次，确认听到的指令和你想表达的一致。', 'Have them try it and check that the instruction was understood.']]),
    ],
  },
  {
    id: 'evidence-agreement', title: '2、4、6，试个反例', style: '黑板游戏 · 数字谜题',
    color: '#38624d', subtitle: ['#172d25', '#fff5d0'], poster: 2.6,
    sound: 'chalk', shots: [
      shot('riddle', 9, [[0, '2、4、6 符合一个规则。猜一个规则，再想一组三个数来试。', '2, 4, 6 follow a rule. Guess a rule, then choose a triple to test it.']]),
      shot('positive', 9, [[0, '猜“每次加 2”时，8、10、12 能通过。', 'If you guessed “add two,” 8, 10, 12 will be accepted.'], [4.6, '递增也能通过，两种猜法还分不开。', 'Increasing triples also pass. This test cannot distinguish the two rules.']]),
      shot('counterexample', 11, [[0, '试试 3、5、9。它递增，却不总是加 2。', 'Try 3, 5, 9. It increases without always adding two.'], [5.1, '它也符合。这个结果排除了“必须每次加 2”。', 'It passes. That rules out “must add two each time.”']]),
      shot('reveal-rule', 10, [[0, '沃森的规则发现任务，考验的是你会怎样选证据。', 'Wason’s rule-discovery task tests how you choose evidence.'], [4.7, '两条规则都预言“符合”时，这组数就区分不了它们。', 'A triple cannot distinguish two rules when both predict that it will pass.']]),
      shot('line-study', 12, [[0, '还有一种干扰来自别人。阿希请参与者判断线段长度。', 'Another influence comes from other people. Asch asked participants to match line lengths.'], [5.6, '即使答案就在眼前，一致的错误多数也会影响一些判断。', 'A unanimous incorrect majority influenced some judgments.']]),
      shot('answer-alone', 10, [[0, '先独立写下猜想，再找一条能让两个解释给出不同答案的证据。', 'Write your guess independently, then look for a test that separates explanations.'], [5.2, '举手的数量可以提示你去检查。能区分解释的是测试结果。', 'A vote can prompt a check. A diagnostic test distinguishes the explanations.']]),
    ],
  },
  {
    id: 'framing-choice', title: '一张票的两面', style: '双色印刷 · 实物翻面',
    color: '#c64a34', subtitle: ['#a33a28', '#fff7e6'], poster: 2.3,
    sound: 'press', shots: [
      shot('ticket', 8, [[0, '同一批体验名额。100 人里，有 90 人抽中。', 'Of 100 people, 90 got a spot in the same draw.']]),
      shot('flip', 10, [[0, '翻到票的另一面。100 人里，有 10 人没抽中。', 'Turn the ticket over. Of 100 people, 10 did not get a spot.'], [5, '两面说的是同一批人。你先注意到的部分变了。', 'Both sides refer to the same group. Your first focus changed.']]),
      shot('ink', 9, [[0, '把两种印刷叠到同一个网格上，分母一直是 100。', 'Overlay the two prints. The denominator stays at 100.'], [4.5, '表达方式可能影响评价，这叫框架效应。', 'The wording can influence evaluations. This is a framing effect.']]),
      shot('package', 11, [[0, '食品研究比较过“75% 瘦肉”和“25% 脂肪”两种标签。', 'A food study compared labels saying “75% lean” and “25% fat.”'], [5.4, '标成“75% 瘦肉”时评价更正面。品尝后，措辞影响减弱。', 'The “75% lean” label was rated more favorably. Tasting reduced the effect.']]),
      shot('two-choices', 11, [[0, '给属性换个说法，和在确定与有风险的结果间选择，是两件事。', 'Relabeling an attribute and choosing between a certain and a risky outcome are different tasks.'], [5.9, '先确定比较的是谁、哪个结果、用什么分母。', 'First identify the group, outcome, and denominator.']]),
      shot('both-sides', 8, [[0, '做决定前，把正面和反面写成同一句。', 'Before deciding, write both sides in one sentence.'], [4, '100 人里，90 人抽中，10 人没抽中。', 'Of 100 people, 90 got a spot and 10 did not.']]),
    ],
  },
  {
    id: 'future-cost', title: '已经投进去的币', style: '像素街机 · 路线选择',
    color: '#7864bd', subtitle: ['#211939', '#fff4b9'], poster: 2.2,
    sound: 'arcade', shots: [
      shot('insert', 8, [[0, '你投了三枚不能退的代币，才发现这个游戏不太好玩。', 'You spent three non-refundable tokens and found the game uninteresting.']]),
      shot('locked', 9, [[0, '已经付出、现在收不回来的三枚币，是沉没成本。', 'The three spent and unrecoverable tokens are sunk costs.'], [4.6, '继续玩，或者现在离开，它们都留在机器里。', 'They stay in the machine whichever option you choose.']]),
      shot('fork', 11, [[0, '真正会被下一步改变的是后面二十分钟。', 'What your next choice can change is the next twenty minutes.'], [5.2, '继续玩能得到什么？把时间留给另一件事又能得到什么？', 'What would continuing give you? What would doing something else give you?']]),
      shot('refund', 11, [[0, '如果还有一张票能退，退回的金额要算进现在的选择。', 'If a ticket is refundable, include that refund in today’s decision.'], [5.2, '违约代价、剩余乐趣和未来学习机会，也仍然相关。', 'Switching costs, remaining enjoyment, and future learning can still matter.']]),
      shot('reset', 9, [[0, '把画面停在现在。假如刚到这儿，你会怎么用剩下的时间？', 'Pause at the present. If you had just arrived, how would you spend the remaining time?']]),
      shot('credits', 8, [[0, '选择留下或转身，都用下一步的收获和代价作理由。', 'Choose to stay or leave based on what the next step costs and offers.']]),
    ],
  },
  {
    id: 'measurement-inference', title: '测得稳，真的测对了吗', style: '测量蓝图 · 仪器与脑图',
    color: '#2c5c9d', subtitle: ['#102b54', '#e9f9ff'], poster: 2,
    sound: 'lab', shots: [
      shot('gauge', 9, [[0, '同一个练习册，放上秤三次。读数每次都很接近。', 'Weigh the same notebook three times. The readings are close.'], [4.5, '在适当条件下，结果的一致性是信度的问题。', 'Under suitable conditions, consistency is a question of reliability.']]),
      shot('wrong-tool', 10, [[0, '现在拿这台秤来回答“跑道有多长”。', 'Now try to answer “how long is the track?” with the scale.'], [4.6, '读数再稳定，也还要证明它支持你打算作的解释。', 'Even consistent readings need evidence for the interpretation you intend.']]),
      shot('validity', 11, [[0, '效度要看证据，支持什么解释，用于什么人、什么用途。', 'Validity asks what interpretation is supported, for whom, and for what use.'], [5.4, '一种用途的证据，不能自动移到另一个用途。', 'Evidence for one use does not automatically transfer to another.']]),
      shot('scan', 12, [[0, '脑成像可以比较任务条件下的脑活动线索。', 'Brain imaging can compare activity-related signals across task conditions.'], [5.1, '同一片区域可能在不止一种任务中出现活动变化。', 'A region can show changes during more than one kind of task.']]),
      shot('inverse', 11, [[0, '这个任务可能让区域变亮。仅凭亮区，还猜不出具体做的是哪项任务。', 'A task can activate a region. That region alone does not identify which task was performed.'], [6, '比较条件、替代解释和其他证据都很重要。', 'Comparisons, alternatives, and other evidence matter.']]),
      shot('instrument-tags', 10, [[0, '看到一个分数或一块亮区，先问它测到了什么，再问它支持哪一步推断。', 'For a score or a bright region, ask what was measured and what it supports.']]),
    ],
  },
  {
    id: 'research-chain', title: '一辆冰淇淋车的调查', style: '微缩校园 · 数据从现场长出来',
    color: '#ad6244', subtitle: ['#56352c', '#fff7dc'], poster: 2.5,
    sound: 'campus', shots: [
      shot('campus', 8, [[0, '放学时，卖得越多的日子，树荫下的人也越多？', 'After school, do higher-sales days also have more people in the shade?']]),
      shot('sample', 10, [[0, '我们在午后的球场旁连续记录几天。', 'We observe several afternoons beside one court.'], [4.4, '这批日子和地点，就是这次问题里的样本。', 'Those days and that place define the observed sample.']]),
      shot('day-log', 10, [[0, '每天记两件事。卖出的份数，和同一时刻在树荫里的人数。', 'Each day record scoops sold and the number of people in the shade at one moment.'], [5, '把同一天的两个数画成同一个点。', 'Plot each day’s paired counts as one dot.']]),
      shot('scatter', 10, [[0, '示意图上的点向右上聚集，说明两个数量一起变化。', 'The illustrative dots trend upward, showing two quantities changing together.'], [5, '这样的关系可以叫正相关。', 'That pattern is a positive correlation.']]),
      shot('heat', 11, [[0, '也许天气越热，两件事都更容易发生。', 'Hotter weather might increase both quantities.'], [5, '这个共同原因是待检验的解释，还需要记录温度并比较。', 'That common cause is a hypothesis. Record and compare temperatures to investigate it.']]),
      shot('replicate', 11, [[0, '换一段时间或换个校园，照同样的方法重新记录。', 'Repeat the same method at another time or campus.'], [5.1, '如果关系再次出现，我们多了一份证据，也要检查条件的差别。', 'A recurring pattern adds evidence, and differences in conditions still matter.']]),
      shot('field-notes', 9, [[0, '先问样本从哪来，再问还有什么解释，最后看别人能否再做出来。', 'Ask where the sample came from, what else might explain it, and whether others can repeat it.']]),
    ],
  },
  {
    id: 'clear-boundaries', title: '把今天的时间摊开', style: '剪贴剧场 · 时间带剪裁',
    color: '#ce624e', subtitle: ['#6d372f', '#fff6e6'], poster: 2.6,
    sound: 'cutout', shots: [
      shot('request', 9, [[0, '朋友把整份海报推过来：“今晚你全帮我改完吧？”', 'A friend pushes over the whole poster: “Could you redo it all tonight?”']]),
      shot('budget', 10, [[0, '把你今天的时间摊开。已经安排好的事占了大半。', 'Lay out today’s time. Existing plans already take most of it.'], [4.9, '你愿意帮忙，也只空得出二十分钟。', 'You want to help and have twenty minutes available.']]),
      shot('trim', 10, [[0, '“今晚整份我接不了。我有二十分钟，可以一起检查开头。”', '“I can’t take the whole poster tonight. I have twenty minutes to review the opening.”'], [5.8, '把能做的范围和条件说具体，对方才知道怎样安排。', 'Naming the scope and conditions lets the other person plan.']]),
      shot('adjust', 10, [[0, '有余地时，可以协商范围、时间或者分工。', 'When there is room, negotiate scope, timing, or who does what.'], [4.6, '只有你愿意并且做得到的部分，才放进承诺。', 'Commit to the part you can and want to do.']]),
      shot('stop', 9, [[0, '如果对方继续施压或让你不安全，可以结束谈话，找可信任的成人支持。', 'If pressure continues or you feel unsafe, leave the conversation and ask a trusted adult for support.']]),
      shot('agreed', 8, [[0, '边界把你能承担的部分说清楚，也给接下来怎么合作留出空间。', 'A boundary clarifies what you can take on and leaves room for collaboration.']]),
    ],
  },
  {
    id: 'gratitude-both', title: '给今天留两个位置', style: '水彩雨景 · 展开日记',
    color: '#526984', subtitle: ['#2d4051', '#fff8df'], poster: 3.5,
    sound: 'rain', shots: [
      shot('rainwalk', 11, [[0, '放学下雨，公交刚走，你的鞋也湿了。', 'It rains after school. You miss the bus and your shoes get wet.'], [5.1, '等车的时候，有人把伞往你这边挪了一点。', 'While you wait, someone shifts their umbrella to cover you.']]),
      shot('two-pages', 11, [[0, '左页记今天的难处，右页记那一小段被照顾。', 'Put today’s difficulty on the left page and the small kindness on the right.'], [5.3, '两件事都发生过，可以都留下来。', 'Both things happened. Both can stay on the page.']]),
      shot('detail', 10, [[0, '写具体一点。“他挪了半把伞，我的书包没再淋湿。”', 'Be specific. “They moved the umbrella and my bag stayed dry.”'], [5, '感恩记录是在练习留意这些本来容易过去的细节。', 'Gratitude journaling practices noticing details that can slip by.']]),
      shot('experiment', 12, [[0, '埃蒙斯和麦卡洛比较过不同记录任务。', 'Emmons and McCullough compared different journaling assignments.'], [5.2, '与对照组相比，感恩记录组有些福祉指标更好。', 'The gratitude groups did better on some well-being measures than control groups.']]),
      shot('optional', 10, [[0, '把这当成可选的小练习。今天找不到也可以空着。', 'Treat it as an optional exercise. You can leave the page blank today.'], [5, '刚才的双页写法，是把这个思路用在日常的示范。', 'The two-page layout is a practical illustration.']]),
      shot('close-book', 9, [[0, '下次写日记时，给困难和支持各留一个位置。', 'Next time you journal, give both hardship and support a place.']]),
    ],
  },
];

for (const film of films) {
  let time = 0;
  film.cues = [];
  for (const scene of film.shots) {
    scene.start = time;
    scene.end = time + scene.seconds;
    scene.subtitles.forEach(([offset, zh, en], index) => {
      film.cues.push({
        start: time + offset,
        end: time + (scene.subtitles[index + 1]?.[0] ?? scene.seconds),
        zh, en, shot: scene.id,
      });
    });
    time = scene.end;
  }
  film.duration = time;
}
