"""Build readable, beat-aligned films from the independently reviewed narration."""
from pathlib import Path
import json, math, hashlib, re
from storyboards import attach

ROOT=Path(__file__).resolve().parent
def read(name): return json.loads((ROOT/name).read_text(encoding='utf-8'))
def write(name,value):
 p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
 p.write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'

groups=read('groups.json');scripts=read('scripts.json');lessons={l['id']:l for l in read('lessons.json')}
analysis=read('music-analysis.json');bars_grid=analysis['cuts'];cuts=[bars_grid[0]]
for a,b in zip(bars_grid,bars_grid[1:]):
 midpoint=(a+b)/2
 beat=min(analysis['beats'],key=lambda v:abs(v['time']-midpoint))['time']
 cuts.extend([round(beat*60)/60,b])
films=attach(groups,scripts)
music_hash=hashlib.sha256((ROOT/'assets/user-music.aac').read_bytes()).hexdigest()
coverage=[]
for film in films:
 cues=film['cues'];bars=[2]*len(cues)
 # Reading time determines which cues receive a second/third bar. The music
 # does not dictate arbitrary sentence fragments or a fixed number of shots.
 needs=[max(len(c['zh'])/5.0,len(c['en'].split())/3.1)+.45 for c in cues]
 for _ in range(len(cuts)-1-sum(bars)):
  candidates=range(len(cues))
  i=max(candidates,key=lambda i:needs[i]/(bars[i]*1.60))
  bars[i]+=1
 position=0
 for i,(cue,count) in enumerate(zip(cues,bars)):
  cue['start']=cuts[position];cue['end']=cuts[position+count];cue['bars']=count
  cue['beatActions']=[v for v in bars_grid if cue['start']<v<cue['end']]
  cue['transition']='CrossZoom' if i in (8,12) else ('CircleOpen' if i in (4,16,20) else 'DirectionalWipe')
  position+=count
 film['shots']=cues
 film['duration']=math.ceil(cuts[-1]*60)/60
 film['musicSha256']=music_hash
 film['sources']=[];seen=set()
 film['claims']=[]
 for lid in film['lessons']:
  lesson=lessons[lid];coverage.append(lid)
  film['claims'].append({'lessonId':lid,'claim':lesson['evidence']['claim'],'limits':lesson['evidence'].get('limits',lesson['boundary'])})
  for source in lesson['sources']:
   key=source.get('url',str(source)) if isinstance(source,dict) else str(source)
   if key not in seen:film['sources'].append(source);seen.add(key)
 film['narrativePolicy']='One continuous question and explanation; video independent of comic; explicit evidence/example/practice distinctions.'
 film['relatedLessons']=[{'id':lid,'title':lessons[lid]['tags'][0]} for lid in film['lessons']]
 folder=ROOT/'export'/film['id'];folder.mkdir(parents=True,exist_ok=True)
 write(f'export/{film["id"]}/script.json',film)
 vtt='WEBVTT\n\n'+'\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["zh"]}\n{c["en"]}' for i,c in enumerate(cues))+'\n'
 (folder/'subtitles.vtt').write_bytes(vtt.encode('utf-8'))
 lines=[f'# {film["question"]}','',f'串联课程：{", ".join(film["lessons"])}。视频叙事独立于漫画。','']
 for c in cues:lines.extend([f'## {stamp(c["start"])}—{stamp(c["end"])}',c['zh'],c['en'],f'画面：{c["scene"]}；{c["visual"]}。', ''])
 lines+=['## 一手出处与边界','',json.dumps(film['sources'],ensure_ascii=False,indent=2)]
 (folder/'分镜与来源.md').write_bytes(('\n'.join(lines)+'\n').encode('utf-8'))
assert len(coverage)==len(set(coverage))==28
write('episodes.json',films)
write('review/timeline-check.json',{'films':len(films),'coveredLessons':coverage,'cues':sum(len(f['cues']) for f in films),'minSecondsPerChineseCharacter':min((c['end']-c['start'])/len(c['zh']) for f in films for c in f['cues']),'musicSha256':music_hash,'scriptSha256':hashlib.sha256((ROOT/'scripts.json').read_bytes()).hexdigest()})
print(f'{len(films)} films, {len(coverage)} lessons, {sum(len(f["cues"]) for f in films)} connected cues')
