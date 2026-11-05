"""Visual anchors follow the reviewed narration; examples keep one unit and legend."""
ART={
'attention-limits':('注意如何选择','ATTENTION',[
'title|眼前的信息,为什么漏掉','field|追踪白点,当前任务','field|其他变化,目标之外','gates|视野,注意,报告',
'field|优先处理,选择性注意','focus|目标,被选中的对象','split-field|选中细节,未报告细节','gates|进入视野,被注意到,被报告',
'passing|1999,传球视频','passing|白衣队,计数任务','unexpected|意外角色,任务之外','report|报告,遗漏',
'focus|在视野里,未必被注意','conditions|任务,对象,观看条件','person-context|一次遗漏,不能概括全人','target|当时在找什么,观察目标',
'classroom|板书,手势','crowd-search|衣服颜色,其他位置','priority|目标,优先顺序','check|明确目标,检查细节',
'focus-switch|原目标,新目标','two-views|先前观察,再次核对','selection|选择,遗漏','closing|先问当时在看什么,再核对遗漏']),
'memory-calibration':('回忆与信心','MEMORY & METACOGNITION',[
'title|记得清楚,为什么还要核对','memory|线索,不是完整录像','encoding|注意,理解,已有知识','puzzle|不完整线索,初始编码',
'rebuild|线索,重组','new-information|照片,后来听说','sources|经历,转述','rebuild|重建,不是原样播放',
'cars|Loftus · Palmer,1974','wording|影片相同,提问动词不同','glass|另一项实验,一周后,影片没有碎玻璃','research-limit|可以受影响,不等于全部虚假',
'belief|我记得准吗,认知判断','monitor|元认知,判断自己的认知','confidence|清晰熟悉,准确','two-views|感觉,核对结果',
'quote|我确信他说过,原话在哪里','sources|记得的,推断的','record-check|有记录就核对,无记录保留不确定','calibrate|原先信心,核对反馈',
'confidence|确定程度,依据','shared-record|共同记录,共同证据','two-roles|回忆怎样形成,怎样判断回忆','closing|认真记得,容许修正']),
'learning-loop':('从看过到想起','LEARNING THAT LASTS',[
'title|看过三遍,合上书还记得吗','book|材料在眼前,借助线索','book-close|跟得上,独立想起','blank-page|独立尝试,检查保持',
'retrieve|先从记忆找,再看材料','study-design|再学习,提取练习','study-design|学习相同短文,再读或回忆','test-times|5分钟,2天,1周',
'test-result|5分钟,再学习较好','test-result|2天与1周,提取保持较好','two-times|即时表现,长期保持','retrieve|合上材料,自己解释',
'feedback|尝试,缺口,核对','start-gap|知道方法,开始行动','habit|稳定情境,启动线索','schedule|学习收尾,简短自测',
'separate-evidence|研究结论,实践安排','sleep|睡眠,恢复与记忆过程','two-roles|清醒学习,休息','three-roles|怎样练,怎样开始,怎样休息',
'conditions|任务,自己的条件,调整','feedback|先回答一个问题,再核对','delay-check|一段时间后,还能解释吗','closing|练习与反馈,开始与休息']),
'emotion-context':('信号、解释与资源','EMOTION IN CONTEXT',[
'title|同样心跳快,为什么感受不同','heart|身体信号,不是完整答案','stage-context|发生了什么,在意什么,怎样理解','stage-context|展示,被评价',
'heart-context|身体,情境','signal-limit|身体线索,不是诊断','demands|任务要求,可用资源','resources|时间,准备,协作,支持',
'two-tracks|意义解释,真实负荷','load|想法,任务与资源','reappraisal|最初解释,另一解释','stage-heart|心跳快,不等于一定失败',
'stage-reframe|我虽紧张,仍可按准备开始','reappraisal|有时改变反应,情境有差异','limits|不是万能开关,不把坏事说成好事','two-tracks|解释线,负荷线',
'meaning|事实,合理解释','load-options|时间,分工,支持','two-tracks|一起处理,不必只选一边','action|核对,安排,商量',
'support|持续影响生活,成人与专业支持','person-context|一次体验,完整的人','three-roles|身体,解释,资源','closing|找到需要帮助的一环,再选择下一步']),
'comparison-personality':('比较之前，补全画面','COMPARISON & PERSONALITY',[
'title|别人的高光,能给你定性吗','display|一个结果,完整过程','behind-display|失败,疲惫,犹豫','two-views|别人展示,自己的全部',
'social-compare|别人,自我评价','conditions|对象,维度,差距解释','speaking|别人表达流利,我天生不行？','person-context|一次表现,稳定倾向',
'traits|连续维度,相对稳定差异','boxes-open|维度,不是固定盒子','contexts|课堂,朋友,陌生环境','observations|多次观察,交代情境',
'bridge|比较一项差异,不能概括人格','person-context|一个亮点,完整能力','dimension|究竟比较哪一项,同一把尺','conditions|练习,时间,机会,支持',
'behind-display|补回条件,减少笼统标签','method|选择一种方法,自己尝试','speaking-plan|怎样准备发言,具体步骤','observations|具体行为,观察变化',
'limits|不保证比较舒服,特质仍有意义','scope|结论范围,证据范围','two-roles|一项差异,完整的人','closing|带走一个方法,减少一个标签']),
'support-exploration':('支持与自主','SUPPORT & AUTONOMY',[
'title|需要帮助,会更不独立吗','two-roles|得到支持,交出所有决定','support-choice|资源,自己的行动','secure-question|支持,探索',
'secure-base|婴幼儿研究,照顾者回应','secure-base|安全基地,支持探索的关系功能','explore|靠近支持,继续探索','age-scope|婴幼儿情境,不直接给青少年分型',
'age-bridge|青少年生活,换看适龄资料','support-environments|家庭,学校,社区','support-roles|同伴倾听,成人资源,专业支持','support-net|职责不同,不用独自承担',
'help-start|具体困难,不先自行诊断','needs|发生什么,影响哪些生活','trusted-adult|可信任成人,一起商量','support-paths|第一条路径,其他可靠路径',
'ask-needs|倾听,陪伴,实际帮助','small-promise|一件具体可做的事,能力范围','connect-support|持续困扰或安全,连接更多帮助','role-limits|同伴,不独自处理全部情况',
'evidence-levels|依恋研究,适龄求助资料','two-roles|支持,自主','support-choice|资源条件,自己选择求助','closing|可以得到帮助,也参与自己的选择']),
'communication-gap':('从说明到共同理解','COMMUNICATION & INFORMATION',[
'title|你觉得很简单,对方为什么没接上','controls|回到起点,操作面板','observe-controls|按下圆形,装置未回到起点','observation|观察结果,不认真只是解释',
'attribution|行为,寻找原因','cause-options|个人,说明,界面,情境','missing-info|缺什么信息,先核对','two-worlds|已有背景,新手所见',
'symbols|圆形,三角,含义未知','knowledge-study|已知信息,对少信息者的预测','omitted-steps|省略步骤,提出检查问题','limits|信息差是一种可能,不是全部原因',
'ask|你看到了什么,不是更大声重复','symbols-question|两个符号,分别代表什么','listen-back|先听,复述,确认','understanding|核对理解,不替人下定义',
'instructions|一个动作,一个可观察反馈','control-sequence|先按三角,再等黄灯','teachback|试一次,复述一次','conditions|语言,难度,现场条件',
'responsibility|补全原因,再谈责任','three-roles|提出解释,检查信息差,倾听核对','compare-explanations|具体核对,笼统标签','closing|从我说了什么,到我们是否理解同一件事']),
'evidence-agreement':('赞同与检验','AGREEMENT & EVIDENCE',[
'title|大家都同意,就足够证明了吗','rule|2 4 6,偶数递增？','agreement|同一个例子,赞同不是新检验','two-roles|他人意见,区分解释的检验',
'conformity|群体判断,个人回答','line-task|自己观察,群体答案','majority-limit|多数不一定错,少数不自动对','evidence|回到任务证据,怎样核对',
'rule-candidates|8 10 12,偶数递增,任意递增','rule-candidates|同一正例,仍有两种解释','rule-test|3 5 7,预测不同','rule-reveal|本片示例规则,任意递增',
'rule-reject|可以不是偶数,排除额外限制','wason|Wason · 1960,提出例子,获得反馈','confirmation|已有猜想,偏爱相符信息','discriminate|支持例子也可有用,关键看能否区分',
'agreement|有多少人赞成,社会线索','rule-test|哪种解释经得住,任务证据','two-roles|意见,检验','independent|先各自写猜想,写出理由',
'different-predictions|不同猜想,不同预测','feedback|预期,反馈,修正','evidence|有依据改主意,不只数赞同','closing|问大家怎么想,也问证据怎样区分']),
'framing-choice':('把措辞还原为完整信息','FRAMING',[
'title|九成得到,一成没得到','ratios|100个,90得到,10未得到','ratios|90个得到,突出获得','ratios|10个未得到,突出另一面',
'ratios|说法改变,对象没有改变','attribute|同一属性,互补表达','attribute|属性框架,评价','food|Levin · Gaeth · 1988,食品属性研究',
'food|75%瘦肉,25%脂肪','food-result|75%瘦肉标签,评价更正面','taste|实际品尝,效应减弱','conditions|同一组,同一分母,互补结果',
'denominators|报名者,获选者,分母不同','not-equivalent|数字相近,未必等价','risk|确定选项,有风险选项','two-roles|属性措辞任务,风险选择任务',
'ratios|回到同一组圆点,补全信息','ratios|90得到,10未得到,共100','conditions|时间,条件,对象','two-views|突出什么,省略什么',
'choice|不同人,未必同一选择','complete|完整信息,选择依据','denominator-check|数字回到分母,措辞回到条件','closing|不只问听起来怎样,也问完整说法']),
'future-cost':('让选择面对未来','SUNK COST',[
'title|以前花了很多,现在必须继续吗','ticket|不能退款,活动不合适','future-value|接下来有价值,一个理由','past-attachment|以前钱与时间,不想白花',
'time-directions|过去,未来','sunk|已发生,不可收回','past-fixed|继续或离开,过去都不回来','future-options|未来时间,收益,代价',
'sunk-study|Arkes · Blumer · 1985,已有投入与选择','sunk-pull|不可回收投入,影响继续决定','persistence|有未来理由,坚持可以合理','future-factors|技能,承诺,转换成本',
'past-future|不可收回的过去,仍可变化的未来','past-future|未来成本,未来收益','refund|另一种情况,可退部分不算沉没','switching|新责任,新损失,未来一栏',
'future-compare|继续会怎样,付出与得到','future-compare|换路会怎样,付出与得到','future-reasons|两条路,都用未来理由','decision|看清理由,结合具体情况',
'past-future|珍惜过去,调整未来','decision|停下或坚持,看有效理由','two-roles|过去的牵挂,未来的比较','closing|接下来值得吗,不只看以前花多少']),
'measurement-inference':('从观察到解释','MEASUREMENT & INFERENCE',[
'title|一张脑图一个分数,凭什么解释你','outputs|方法结果,不是完整的人','tool-observation|工具,实际观察什么','inference|观察,证据,解释与用途',
'repeat-readings|同一对象,重复读数接近','reliability|一致性,误差','clock-ruler|稳定的钟,不能因此测长度','distance|测距离,需要适合用途的证据',
'validity|分数解释,用途证据','standards|测验标准 · 2014,信度与效度','all-purpose-limit|稳定,不保证解释一切','brain-bridge|脑成像,也需要推断证据',
'brain-task|任务A,任务B,活动差异','brain-processes|一个区域多过程,一个过程多区域','brain-not-read|一个亮点,不能直接读出完整想法','reverse-inference|Poldrack · 2006,反向推断条件',
'evidence|工具有用,推断有条件','inference|观察到解释,证据是连接点','quiz-claim|心理小测验,准备测什么','conditions|对象,误差,人群,用途',
'transfer-validity|年龄,语言,用途改变','teaching-only|图形示意,没有测验或扫描你','alignment|工具,条件,用途','closing|先问能说明什么,再问对生活意味着什么']),
'research-chain':('沿方法追问结论','EVALUATING RESEARCH',[
'title|一个研究结果,凭什么值得相信','court-observe|连续几天下午,球场旁销量与树荫人数','fiction|虚构教学例子,不是真实数据','coverage|全校,还是这一处与时段',
'campus|早晨,其他区域,不去球场的人','coverage|同一处多记几次,补不回未覆盖部分','scope|哪里,何时,哪些人','daily-counts|比较单位是日期,两项计数',
'scatter|某天销量较高,树荫人数也较多','association|相关,原因与方向未知','weather-candidate|天气更热？,销量,树荫人数','candidate|候选共同原因,尚需检验',
'units|按日期的关联,不能直接推到每个人','repeat-observe|同样记录规则,换日期或地点','replication|重复与复核,累积证据','same-different|相同方法,改变条件',
'different-results|结果不同,检查设计与条件','same-results|结果相近,因果仍未自动证明','robustness|重复相关研究,关系是否稳健','competing|研究设计,排查竞争解释',
'research-three|覆盖了谁,怎样解释,还能否再观察','three-limits|不同约束,不能互相替代','headline|惊人标题,回到方法与出处','closing|值得信任的知识,留下可追问的路']),
'clear-boundaries':('把限度说清楚','CLEAR BOUNDARIES',[
'title|想帮忙,也能说做不到吗','group-task|整组任务,只剩一段时间','resources|帮助意愿,真实时间与能力','hidden-limit|限制藏起来,不会自动消失',
'needs-limits|自己的需要,现实限度','can-cannot|能做什么,做不到什么','boundary-message|今天能检查这部分,不能承担全部修改','specific|行动,范围,合作',
'respect|尊重对方,保留判断','assertive|自信表达,不退让也不攻击','disagreement|表达清楚,不保证对方同意','can-cannot|能调整的可以协商,做不到的保持清楚',
'safe-options|安全,现实,双方愿意','arrangements|重新分工,调整时间,寻找资源','not-total|协商,不等于又全部接下','not-control|边界,不是要求别人服从',
'scope-choice|彼此范围,各自选择','confirm-plan|约定,核对理解','change-plan|条件变化,重新商量','safety|安全威胁或不对等,不能只靠话术',
'trusted-adult|可信任成人,合适支持','boundary-meaning|不只是墙,不只一次拒绝','needs-limits-plan|需求,限度,可行安排','closing|认真合作,也包括诚实说明限度']),
'gratitude-both':('让完整的一天被看见','GRATITUDE',[
'title|困难还在,也能看见支持吗','journal-difficulty|今天确实不容易,如实保留','journal-both|增加支持,不删掉困难','add-observation|增加一条观察,不改写事实',
'specific-help|失误未解决,有人帮忙整理','both-true|问题还在,也得到帮助','gratitude|具体支持,值得珍视的事','not-forced|不是我应该开心,不是强迫感受',
'gratitude-study|Emmons · McCullough · 2003,不同记录条件','study-groups|感恩,烦恼,普通事件等','gratitude-result|与对照组相比,部分指标更好','individual-limit|群体平均,不是个人保证',
'practice-scope|可选生活练习,不是原实验复刻','journal-facts|如实发生什么,先写事实','specific-help|谁做了什么,怎样帮到我','journal-both|可以保留,尚未解决的困难',
'concrete-record|支持说具体,困难也说具体','observe-help|记录之后,是否对我有帮助','adjust-pause|增加负担或无帮助,调整或暂停','no-demand|不用感谢伤害,不用否认难受',
'real-action|问题仍需行动,困难仍可求助','action-support|必要行动,必要支持','invitation|多看一条线索,不规定必须怎样感受','closing|这一页,容纳困难与支持']),
}

def attach(groups,scripts):
 result=[]
 for group in groups:
  title,en,rows=ART[group['id']];assert len(rows)==len(scripts[group['id']])
  cues=[]
  for i,(row,cue)in enumerate(zip(rows,scripts[group['id']])):
   scene,labels=row.split('|',1)
   cues.append({**cue,'index':i,'scene':scene,'labels':labels.split(','),'visual':' / '.join(labels.split(','))})
  result.append({**group,'title':title,'english':en,'cues':cues})
 return result
