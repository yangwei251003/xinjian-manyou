"""Build editable OpenFilm projects and portable, deterministic episode pages."""
import argparse
import base64
import hashlib
import html
import json
import shutil
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parents[1]
PRODUCTION=ROOT/'production'
DEFAULT_PROJECTS=Path.home()/'Documents/VideoCreation/Projects/xinjian-manyou-v3'
FONT_SOURCE=Path.home()/'Documents/VideoCreation/Resources/Fonts/NotoSansSC'
MOTIF_DESCRIPTIONS={
    'attention':'圆、三角与方形阵列中，蓝色注意光束缓慢扫动，后出现问号节点。',
    'memory':'九块记忆拼片逐步排列，后来信息从右上方接入，环绕光点持续移动。',
    'calibration':'实际尝试坐标中逐步出现五个点，金色预期弧线与蓝色表现点对照。',
    'sleep':'月亮、持续走动的钟与学习路径相连，微光沿路径移动。',
    'load':'人物上方的任务、时间与资源形成负荷，后向分工和支持两边展开。',
    'network':'多个节点形成网络，光点沿连线传递，突出任务与比较条件。',
    'weather':'雨云和太阳分别连向同一个心跳节点，雨线持续下落。',
    'reframe':'同一框内保留雨云与展览两部分，金色箭头引向仍可采取的行动。',
    'habit':'线索、动作与情境依次连通，随后出现减少准备步骤的金色捷径。',
    'trait':'五条特质连续轴上的光点缓慢移动，标明虚构示意与情境变化。',
    'comparison':'蓝色自己的过程与金色他人展示窗口并列，流动光点连接两种视角。',
    'harbor':'可找到的支持据点与向外探索的卡片相连，探索卡片缓慢远近移动。',
    'crowd':'五个人物与三条不同长度线段并列，金色光点在群体下方移动。',
    'attribution':'未回复手机从观察分岔到个人倾向与情境解释，两条路径分别点亮。',
    'listening':'两个人物之间的对话框与声音短线持续脉动，最后接入核对与询问需要。',
    'framing':'同一百点阵中九十点蓝色、十点金色，标签切换得到与未得到。',
    'investment':'时间轴将无法收回的投入与仍能选择的继续、改变路径分开，时钟持续转动。',
    'retrieval':'两本书从打开到合上，光点走过提取路径，转折处对照五分钟与两天／一周。',
    'care':'人物、可信任成人和专业支持三个节点依次连通，强调具体描述困难。',
    'boundary':'两个人物隔着一道门，能做与做不到分别标记，再用箭头连接可行安排。',
    'support':'六个支持人物围绕中心节点，蓝金光点从不同方向汇入。',
    'causal':'冰淇淋与树荫先相连，随后加入天气候选共同原因，保留因果问号。',
    'sample':'四十个总体点与持续流动的虚线抽样框对照，后扩大覆盖并提出未回应问题。',
    'replication':'五份编号记录通过折线路径相连，光点依次经过方法与比较节点。',
    'robot':'老队员与新同学分居机器人两侧，已有地图与只见按钮形成信息差，再补出操作步骤。',
    'rule':'三张数字卡从2、4、6换成3、5、7，让偶数规则和递增规则给出不同预测。',
    'ruler':'走动的时钟与缓慢摆动的尺并列，用时与距离通过问号分开比较。',
    'journal':'打开的日记里雨云与雨伞并存，雨线持续移动，同时保留困难与支持。',
}
STYLE="""
@font-face{font-family:FilmSans;src:url(data:font/woff2;base64,FONT_DATA) format('woff2');font-weight:100 900}
*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#0a0e1a;font-family:FilmSans,sans-serif;color:#eef5ff}
canvas{position:absolute;inset:0;width:1920px;height:1080px}
.overlay{position:absolute}
#title{left:112px;top:40px;font-size:26px;line-height:40px;color:#92a6c8;white-space:nowrap}
#series{right:112px;top:40px;font-size:24px;line-height:40px;color:#c9a96e}
.scene-heading{left:120px;top:118px;width:1680px;margin:0;text-align:center;font-size:54px;font-weight:500;line-height:82px}
.cue-zh,.cue-en{left:112px;width:1696px;text-align:center;margin:0;white-space:nowrap;font-weight:500}
.cue-zh{top:853px;line-height:66px;font-size:42px}
.cue-en{top:925px;line-height:42px;font-size:23px;font-weight:400;color:#c9a96e}
#stamp{left:112px;top:1010px;line-height:40px;font-size:23px;color:#92a6c8}
#source{right:112px;top:1010px;line-height:40px;font-size:23px;color:#92a6c8}
#rail{left:112px;top:984px;width:1696px;height:2px;background:#2a3a54}
#progress{height:100%;background:#c9a96e}
.capture .overlay{visibility:hidden}
"""

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def font_data(films,renderer,font_source):
    target=PRODUCTION/'assets/FilmSans.woff2'
    target.parent.mkdir(parents=True,exist_ok=True)
    needed=set(json.dumps(films,ensure_ascii=False)+renderer+'VIBE STUDIES / 图形为教学示意 0123456789→？')
    options=subset.Options()
    options.flavor='woff2'
    options.layout_features=['*']
    full_font=font_source/'NotoSansSC.ttf'
    font=TTFont(full_font if full_font.exists() else target,recalcTimestamp=False)
    cmap=font.getBestCmap()
    missing=sorted(c for c in needed if ord(c)>127 and c not in '\u200b\u3000' and ord(c) not in cmap)
    if missing:
        raise ValueError('Missing font glyphs. Supply --font-source with a full NotoSansSC.ttf: '+''.join(missing))
    if not full_font.exists():
        return base64.b64encode(target.read_bytes()).decode()
    sub=subset.Subsetter(options=options)
    sub.populate(text=''.join(sorted(needed)))
    sub.subset(font)
    font.flavor='woff2'
    font.save(target)
    shutil.copy2(font_source/'LICENSE.txt',target.parent/'NotoSansSC-OFL.txt')
    return base64.b64encode(target.read_bytes()).decode()

def episode_html(film,renderer,font):
    escape=html.escape
    sections=''.join(f'<h2 class="overlay scene-heading" id="scene-title-{i}">{escape(s["label"])}</h2>' for i,s in enumerate(film['stages']))
    captions=''.join(f'<p class="overlay cue-zh" id="cue-zh-{i}" lang="zh-CN">{escape(c["zh"])}</p><p class="overlay cue-en" id="cue-en-{i}" lang="en">{escape(c["en"])}</p>' for i,c in enumerate(film['cues']))
    source=escape(film['anchor']['author'])
    art=ROOT/'assets/panels'/film['id']/'06.webp'
    image='data:image/webp;base64,'+base64.b64encode(art.read_bytes()).decode()
    data=json.dumps({**film,'artData':image},ensure_ascii=False).replace('</','<\\/')
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>{escape(film["title"])}</title><style>{STYLE.replace("FONT_DATA",font)}</style></head><body><canvas id="picture" width="1920" height="1080" aria-label="心理机制教学动画"></canvas><div class="overlay" id="title">{escape(film["title"])}</div><div class="overlay" id="series">VIBE STUDIES / {film["seed"]-99:02d}</div>{sections}{captions}<div class="overlay" id="rail"><div id="progress"></div></div><span class="overlay" id="stamp"></span><span class="overlay" id="source">{source}</span><script id="film-data" type="application/json">{data}</script><script>{renderer}</script></body></html>'''

def timeline(film):
    clips=[]
    for scene in film['stages']:
        src=f'pages/episode.html#t={scene["start"]:.8f},{scene["end"]:.8f}'
        clips.append(f'<iframe id="{scene["id"]}" src="{src}" at="{scene["start"]:.8f}" data-link="{scene["id"]}"></iframe>')
    effects=[]
    for i,scene in enumerate(film['stages'][1:],start=1):
        effects.append(f'<audio id="accent-{i}" src="audio/accent.wav#t=0,0.70" at="{scene["start"]:.8f}" volume="0.25" data-link="{scene["id"]}"></audio>')
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"></head><body>\n<section aria-label="主画面">\n'+'\n'.join(clips)+'\n</section>\n<section aria-label="音乐">\n'+f'<audio id="music" src="audio/music.wav#t=0,{film["duration"]:.8f}" volume="1"></audio>\n</section>\n<section aria-label="动作音效">\n'+'\n'.join(effects)+'\n</section>\n</body></html>\n'

def vtt_time(t):
    n=round(t*1000)
    return f'{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d}.{n%1000:03d}'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--projects',type=Path,default=DEFAULT_PROJECTS)
    parser.add_argument('--font-source',type=Path,default=FONT_SOURCE)
    args=parser.parse_args()
    films=json.loads((PRODUCTION/'films.json').read_text(encoding='utf-8'))
    lessons=json.loads((ROOT/'content/lessons.json').read_text(encoding='utf-8'))
    lesson_map={l['id']:l for l in lessons}
    renderer=(PRODUCTION/'renderer.js').read_text(encoding='utf-8')
    for film in films:
        folder=args.projects/film['id']
        episode=folder/'pages/episode.html'
        expected=folder/'.director-source-sha256'
        if episode.exists() and expected.exists() and sha(episode)!=expected.read_text().strip():
            raise ValueError(f'User-edited page preserved. Review before rebuilding {episode}')
    font=font_data(films,renderer,args.font_source)
    report=[]
    for film in films:
        folder=args.projects/film['id']
        episode=folder/'pages/episode.html'
        episode.parent.mkdir(parents=True,exist_ok=True)
        (folder/'audio').mkdir(exist_ok=True)
        episode.write_text(episode_html(film,renderer,font),encoding='utf-8')
        (folder/'.director-source-sha256').write_text(sha(episode)+'\n')
        film_path=folder/'film.html'
        if not film_path.exists():film_path.write_text(timeline(film),encoding='utf-8')
        timeline_marker=folder/'.director-timeline-sha256'
        if not timeline_marker.exists():
            if film_path.read_text(encoding='utf-8')!=timeline(film):
                raise ValueError(f'Existing timeline preserved for review: {film_path}')
            timeline_marker.write_text(sha(film_path)+'\n')
        lesson=lesson_map[film['id']]
        sources=lesson['sources']
        facts={
            'id':film['id'],
            'core_claim':lesson['evidence']['claim'],
            'evidence_limits':lesson['evidence']['limits'],
            'mechanism':lesson['mechanism'],
            'research_anchor':{'credit':film['anchor'],'script_statements':film['cues'][2:5]},
            'sources':sources,
            'daily_application':film['cues'][12:15],
            'closing':{'type':'原创总结，研究者姓名标记出处','cues':film['cues'][15:]},
            'review_status':'已关联课程出处与证据边界，专业逐条审读待完成',
        }
        write_json(folder/'facts.json',facts)
        motif=MOTIF_DESCRIPTIONS[film['motif']]
        visuals=[
            '大号问题淡入，主题机制缩小置于下方。'+motif,
            '资料卡显示研究者与年份，右侧问题、比较、边界三个节点依次点亮。',
            '主题机制逐步展开。'+motif,
            '左侧金色“等等”与短划线强调反转，右侧机制图移动缩放。'+motif,
            '左侧机制图缩小，右侧出现本课第六格漫画并持续轻微推拉，金色路径连接二者。',
            '收束句放大居中，蓝色椭圆和金色光点缓慢移动，保留出处与片尾余韵。',
        ]
        scenes=[{**scene,'visual':visuals[i]} for i,scene in enumerate(film['stages'])]
        write_json(folder/'storyboard.json',{**film,'stages':scenes,'sources':sources})
        write_json(folder/'audio-cues.json',{'bpm':film['bpm'],'original':True,'events':[{'shot':s['id'],'at':s['start'],'type':'synthesized soft accent','transient_offset':0.0} for s in film['stages'][1:]]})
        write_json(folder/'asset-manifest.json',{'schema':2,'title':film['title'],'sources':sources,'comic_scene':{'image':f'assets/panels/{film["id"]}/06.webp','sha256':sha(ROOT/f'assets/panels/{film["id"]}/06.webp'),'license':'CC BY 4.0 in the scope of the project rights','output':[film['stages'][4]['start'],film['stages'][4]['end']],'candidates':['04.webp','05.webp','06.webp'],'primary':'06.webp','backups':['04.webp','05.webp']},'generated_visuals':{'engine':'production/renderer.js','motif':film['motif'],'seed':film['seed'],'external_video_footage':False},'font':{'name':'Noto Sans SC','license':'OFL-1.1','sha256':sha(PRODUCTION/'assets/FilmSans.woff2')},'music':{'type':'original synthesized score','script':'production/score.py'},'segments':[{'id':s['id'],'source_shot_id':film['id']+'/'+s['id'],'output_in':s['start'],'output_out':s['end']} for s in film['stages']]})
        (folder/'AGENTS.md').write_text('本工程属于心间漫游心理学短片。修改前读取当前用户的 .codex/skills/video-creation-director/SKILL.md（如已安装）。保留用户手改、锁定轨道和版本。页面暴露 window.render(t) 与 window.film.frame(t)，全部状态从时间推导。字幕位于独立 DOM 节点 cue-zh-* 与 cue-en-*，可局部编辑。音乐为原创合成，动作音效已与对应镜头链接。重新生成前核对 .director-source-sha256。',encoding='utf-8')
        dest=ROOT/'assets/videos'/film['id']
        dest.mkdir(parents=True,exist_ok=True)
        write_json(dest/'facts.json',facts)
        write_json(dest/'script.json',{'id':film['id'],'title':film['title'],'duration':film['duration'],'cues':[{**cue,'visual':next(s['label'] for s in film['stages'] if s['start']<=cue['start']<s['end'])} for cue in film['cues']],'sources':sources})
        for lang in ('zh','en'):
            rows=['WEBVTT','']
            for cue in film['cues']:rows.extend([f'{vtt_time(cue["start"])} --> {vtt_time(cue["end"])}',cue[lang],''])
            (dest/f'{lang}.vtt').write_text('\n'.join(rows),encoding='utf-8')
        md=[f'# {film["title"]}','',f'{film["duration"]:.2f} 秒 · 1920×1080 · 60fps · {film["bpm"]} BPM','',
            '## 事实核对表','',
            '| 项目 | 内容 |','|---|---|',
            f'| 核心主张 | {facts["core_claim"]} |',
            f'| 证据边界 | {facts["evidence_limits"]} |',
            f'| 教学比喻 | {lesson["mechanism"]["metaphorLimit"]} |',
            f'| 资料锚点 | {film["anchor"]["year"]} · {film["anchor"]["author"]} |',
            '| 收束文字 | 原创总结，研究者姓名标记出处 |',
            '| 审读状态 | 已关联课程出处与证据边界，专业逐条审读待完成 |','']
        for scene in scenes:
            md.extend([f'## {vtt_time(scene["start"])} — {vtt_time(scene["end"])} · {scene["label"]}','',scene['visual'],'',f'第 {scene["start"]*film["bpm"]/240+1:g} 小节进入，按76 BPM四拍对齐；首场之后均有独立柔和动作音。',''])
            for cue in film['cues']:
                if scene['start']<=cue['start']<scene['end']:
                    md.extend([f'### {vtt_time(cue["start"])} — {vtt_time(cue["end"])}','',cue['zh'],'',cue['en'],''])
        md+=['## 核查出处','']+[f'- [{s["title"]}]({s["url"]})' for s in sources]
        (folder/'分镜脚本.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
        report.append({'id':film['id'],'project':str(folder),'page_sha256':sha(episode)})
    write_json(args.projects/'projects.json',report)
    print(f'Built {len(report)} editable OpenFilm projects, scripts and VTTs.')
if __name__=='__main__':main()
