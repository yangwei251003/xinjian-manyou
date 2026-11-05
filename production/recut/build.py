"""Author explicit, non-looping shot plans for the supplied music."""
import json
from narration import EXTRAS
from pathlib import Path
ROOT=Path(__file__).resolve().parent

TOPICS={
 'attention':('注意的选择','ATTENTION',['目标','选择','遗漏','任务','线索','再观察'],'field'),
 'memory':('记忆的重建','RECONSTRUCTION',['经历','碎片','后来信息','重建','确信','核对'],'tiles'),
 'metacognition':('看见理解的缺口','METACOGNITION',['熟悉感','预期','尝试','反馈','缺口','再练习'],'calibration'),
 'sleep':('给学习留一个夜晚','SLEEP & MEMORY',['清醒学习','休息','整理','线索','回忆','作息'],'clock'),
 'stress':('拆开看不见的负荷','STRESS',['任务','时间','资源','反应','分工','支持'],'load'),
 'brain':('一个亮点以外','BRAIN NETWORKS',['区域','网络','任务','比较','解释','证据'],'brain'),
 'emotions':('身体信号的多种解释','EMOTION',['身体信号','情境','目标','解释','感受','需要'],'weather'),
 'reappraisal':('一件事，多种视角','REAPPRAISAL',['事实','初始解释','另一视角','失望','选择','行动'],'window'),
 'habits':('把开始变得容易','HABITS',['线索','小动作','稳定情境','重复','准备成本','安排'],'path'),
 'personality':('人，超过一个标签','PERSONALITY',['倾向','情境','行为','维度','持续观察','变化'],'sliders'),
 'comparison':('看到别人画面之外','SOCIAL COMPARISON',['自己过程','别人展示','比较维度','解释','策略','成长'],'gallery'),
 'attachment':('连接，让探索成为可能','ATTACHMENT',['回应','安全基地','探索','连接','需要','约定'],'harbor'),
 'conformity':('在人群中保留判断','CONFORMITY',['自己的判断','他人的答案','信息','合群压力','理由','证据'],'crowd'),
 'attribution':('判断之前，多一帧','ATTRIBUTION',['看见的行为','个人倾向','情境背景','未知信息','问一问','下一次'],'phone'),
 'listening':('给一句话留出空间','LISTENING',['听见','复述','核对','感受','需要','选择'],'dialogue'),
 'framing':('给选择同一把尺','FRAMING',['同一结果','得到90','未得到10','同一分母','描述','比较'],'matrix'),
 'sunk-cost':('把方向交还未来','SUNK COST',['过去投入','无法收回','未来成本','未来收益','继续','改变'],'fork'),
 'retrieval':('从记忆里，走一遍','RETRIEVAL PRACTICE',['重复阅读','主动提取','5分钟','2天 / 1周','核对','再尝试'],'book'),
 'help-seeking':('求助可以从一句话开始','HELP SEEKING',['具体困难','生活影响','可信任成人','合适服务','疑问','支持'],'support'),
 'boundaries':('合作也需要清楚的边界','BOUNDARIES',['观察','能做','做不到','尊重','安排','合作'],'door'),
 'support':('把支持连成一张网','SUPPORT',['倾听','陪伴','实际帮助','资源','转介','自己的限度'],'people'),
 'correlation':('让因果留下一个问号','CORRELATION',['共同变化','冰淇淋','树荫','天气','其他解释','检验'],'causal'),
 'sampling':('谁被这张问卷漏掉了','SAMPLING',['目标总体','抽样入口','覆盖','回应','遗漏','代表性'],'sample'),
 'replication':('让好奇经得起追问','REPLICATION',['方法','材料','公开记录','条件','比较','累积'],'papers'),
 'knowledge-curse':('你脑中的隐藏地图','CURSE OF KNOWLEDGE',['已有地图','新手视角','省略步骤','信息差','解释','复述'],'robot'),
 'confirmation-bias':('给猜想留一条改道','CONFIRMATION BIAS',['2 4 6','偶数规则','递增规则','3 5 7','不同预测','反例'],'rule'),
 'test-validity':('一块准表，能量赛道吗','RELIABILITY & VALIDITY',['读数稳定','重复测量','测什么','用来做什么','误差','证据'],'ruler'),
 'gratitude':('困难与支持，可以同页','GRATITUDE',['困难','具体支持','记录','感受','选择','边界'],'journal'),
}
KINDS=['hook','aperture','comic','kinetic','archive','object','comic','field','tunnel','gate','relay','contrast','scale','comic','paths','stream','evidence','compare','impact','timeline','comic','explode','focus','causal','kinetic','comic','context','steps','assemble','interact','equation','comic','bridge','limits','kinetic','identity','action','question','closing','constellation','credits','outro']
CORE_CUES={0:0,3:1,4:2,5:3,7:4,8:5,10:6,12:7,14:8,18:9,19:10,22:11,24:12,27:13,30:14,36:15,38:16,40:17}
TITLES={1:'你看见的，只是一部分',9:'让信息走过不同的路径',11:'同一画面，两种解释',15:'线索怎样抵达你',16:'回到资料原来的条件',17:'换一个例子，再看一次',21:'把省略的部分拆开',23:'让箭头，承担具体含义',26:'回到你的生活',28:'一个步骤，也可以说清楚',29:'给理解一个可见的反馈',32:'换个情境，试着迁移',33:'给结论留出边界',34:'一次体验，不能给人定型',35:'让人，超过一个标签',37:'下次，你会怎样问',39:'把零散的线索连起来',41:'带着问题，继续走'}

def main():
 lessons=json.loads((ROOT/'lessons.json').read_text(encoding='utf-8'))
 originals={x['id']:x for x in json.loads((ROOT/'original-scripts.json').read_text(encoding='utf-8'))}
 music=json.loads((ROOT/'music-analysis.json').read_text(encoding='utf-8'))
 cuts=music['cuts'];assert len(cuts)==43
 episodes=[]
 for lesson in lessons:
  id=lesson['id'];title,english,labels,object_name=TOPICS[id];old=originals[id]
  shots=[];panel=0
  for i,kind in enumerate(KINDS):
   item={'id':f'{id}-{i+1:02d}','index':i,'kind':kind,'start':cuts[i],'end':cuts[i+1],
    'heading':TITLES.get(i,labels[(i//3)%6]),'object':object_name,'labels':labels,
    'transition':['CircleOpen','DirectionalWipe','Doorway','DirectionalWipe','CircleOpen','CrossZoom'][i%6],
    'camera':{'angle':[-.11,.08,.0,.13,-.07][i%5],'push':[.13,-.09,.06,.18][i%4]},
    'source_shot_id':f'generated/{id}/{i:02d}','use_count':1}
   if kind=='comic':
    panel+=1;item['panel']=panel;item['heading']=lesson['panels'][panel-1]['caption'];item['text']=lesson['panels'][panel-1]['dialogue'];item['en']='THE STORY / '+str(panel)
   elif i in CORE_CUES:
    cue=old['cues'][CORE_CUES[i]];item.update(text=cue['zh'],en=cue['en'])
    if kind in ('hook','kinetic','impact','closing','credits'):item['heading']=cue['zh']
   else:
    item['text']=TITLES.get(i,lesson['mechanism']['steps'][(i//4)%len(lesson['mechanism']['steps'])]);item['en']=english
   if i in EXTRAS[id]:
    item['text']=EXTRAS[id][i]
    item['en']=english
    item['heading']=['从一个问题开始','原理怎样发生','换个视角看','回到生活','保留证据边界','带着问题继续'][min(5,i//7)]
    if kind in ('hook','kinetic','impact','closing','outro'):item['heading']=item['text']
   # Topic-specific actions replace generic decorations in the four pilot narratives.
   if id=='attention':
    item['action']={1:'search',5:'gorilla',8:'bottleneck',9:'filter',10:'priority',12:'switch',14:'search2',15:'report',17:'blindspot',19:'tasks',21:'eye',22:'layers',23:'distinction',26:'school',28:'goal',29:'feedback',32:'transfer',35:'identity',39:'reveal'}.get(i,'attention')
   elif id=='knowledge-curse':
    item['action']={1:'maps',5:'hidden',8:'expert',9:'novice',10:'signal',12:'gap',14:'buttons',15:'compressed',17:'incomplete',19:'perspectives',21:'explode',22:'lamp',23:'sequence',26:'classroom',28:'assemble',29:'teachback',32:'transfer',35:'identity',39:'shared'}.get(i,'robot')
   elif id=='retrieval':
    item['action']={1:'closed',5:'experiment',8:'reading',9:'recall',10:'routes',12:'feedback',14:'memory',15:'search',17:'immediate',19:'delayed',21:'card',22:'comparison',23:'conditions',26:'school',28:'reconstruct',29:'check',32:'transfer',35:'identity',39:'spaced'}.get(i,'book')
   elif id=='attribution':
    item['action']={1:'message',5:'arriving',8:'observation',9:'person',10:'context',12:'missing',14:'fork',15:'evidence',17:'weather',19:'perspective',21:'expand',22:'contextualize',23:'causal',26:'school',28:'ask',29:'agree',32:'transfer',35:'identity',39:'window'}.get(i,'phone')
   else:item['action']=object_name+'-'+kind
   shots.append(item)
  sources=lesson['sources']
  episode={'id':id,'title':old['title'],'displayTitle':title,'english':english,'labels':labels,'object':object_name,'seed':old['seed'],
   'duration':music['duration'],'bpm':music['bpm'],'music':'assets/user-music.aac','musicSha256':music['source_sha256'],
   'anchor':old['anchor'],'shots':shots,'sources':sources,'mechanism':lesson['mechanism'],'evidence':lesson['evidence'],
   'prediction':lesson['prediction'],'quiz':lesson['quiz'],'takeaway':lesson['takeaway']}
  episodes.append(episode)
 (ROOT/'episodes.json').write_text(json.dumps(episodes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Authored 28 x 42 unique shot records; each panel appears once; original supplied AAC bound.')
if __name__=='__main__':main()
