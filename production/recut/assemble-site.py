"""Assemble a self-contained local edition without replacing the public release."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import zipfile

ROOT=Path(__file__).resolve().parent
SITE=ROOT.parents[1]
DEST=ROOT/'website'
EXPORT=ROOT/os.environ.get('XINJIAN_EXPORT_DIR','revised' if (ROOT/'revised').exists() else 'export')

def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def install(source,target,binary=False):
 target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():
  if source.stat().st_size==target.stat().st_size and (binary or source.read_bytes()==target.read_bytes()):return
  target.unlink() # A generated single output, never a recursive cleanup.
 if binary:
  try:os.link(source,target);return
  except OSError:pass
 shutil.copy2(source,target)

def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}'

def main():
 assert DEST.resolve().parent==ROOT.resolve()
 episodes=json.loads((ROOT/'episodes.json').read_text(encoding='utf-8'))
 technical=[]
 for e in episodes:
  folder=EXPORT/e['id']
  data=json.loads((folder/'technical.json').read_text(encoding='utf-8'))
  assert data['id']==e['id'] and data['frames']==8112
  assert hashlib.sha256((folder/'film.mp4').read_bytes()).hexdigest()==data['fileHash']
  technical.append(data)
 assert len({x['sourceHash'] for x in technical})==1,'Export versions must agree'
 DEST.mkdir(exist_ok=True)
 for directory in ['src','assets','content','scripts']:
  for source in (SITE/directory).rglob('*'):
   if not source.is_file():continue
   rel=source.relative_to(SITE)
   if rel.parts[:2]==('assets','videos'):continue
   install(source,DEST/rel,source.suffix.lower() in {'.webp','.png','.jpg','.woff2','.ttf'})
 for filename in ['index.html','LICENSE','CONTENT-LICENSE.md','package.json','START_WINDOWS.bat','start.sh','.nojekyll']:
  install(SITE/filename,DEST/filename)
 media=json.loads((SITE/'assets/media.json').read_text(encoding='utf-8'))
 for e in episodes:
  id=e['id'];folder=EXPORT/id;web=DEST/'assets/videos'/id
  for name in ['film.mp4','poster.webp']:install(folder/name,web/name,True)
  cues=[{'start':s['start'],'end':s['end'],'zh':s['text'],'en':s['en'],'visual':s['kind']+' / '+s['action'],'source_shot_id':s['source_shot_id']} for s in e['shots']]
  script={'id':id,'title':e['title'],'duration':e['duration'],'edition':'supplied-music-recut','cues':cues,'sources':e['sources']}
  write(folder/'script.json',script);write(web/'script.json',script)
  facts={'id':id,'core_claim':e['evidence']['claim'],'evidence_limits':e['evidence']['limits'],'mechanism':e['mechanism'],'sources':e['sources']}
  write(folder/'facts.json',facts);write(web/'facts.json',facts)
  vtt='WEBVTT\n\n'+'\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["zh"]}\n{c["en"]}' for i,c in enumerate(cues))+'\n'
  (folder/'captions.vtt').write_text(vtt,encoding='utf-8');(web/'captions.vtt').write_text(vtt,encoding='utf-8')
  md=f'# {e["title"]}\n\n原始附件配乐，{e["duration"]:.2f}秒，1920×1080，60fps。\n\n'
  md+='\n\n'.join(f'**{stamp(c["start"])}–{stamp(c["end"])}**　{c["visual"]}\n\n{c["zh"]}\n\n{c["en"]}' for c in cues)
  md+='\n\n## 出处\n\n'+'\n'.join(f'- [{s["title"]}]({s["url"]})：{s["note"]}' for s in e['sources'])+'\n'
  (folder/'分镜与字幕.md').write_text(md,encoding='utf-8')
  media[id]['video']={'src':f'assets/videos/{id}/film.mp4','poster':f'assets/videos/{id}/poster.webp','meta':f'assets/videos/{id}/script.json','title':e['title'],'duration':e['duration']}
 runtime_package=json.loads((DEST/'package.json').read_text(encoding='utf-8'));runtime_package['version']='3.1.0';runtime_package['scripts']={'start':'node scripts/serve.mjs','dev':'node scripts/serve.mjs','validate':'node scripts/validate-content.mjs'};write(DEST/'package.json',runtime_package)
 write(DEST/'assets/media.json',media)
 release=json.loads((DEST/'content/release.json').read_text(encoding='utf-8'));release['edition']='supplied-music-recut';release['filmDurationRange']={'min':60,'max':150};write(DEST/'content/release.json',release)
 validator=DEST/'scripts/validate-content.mjs'
 code=validator.read_text(encoding='utf-8').replace("assert(film.duration>=60&&film.duration<=120,`${l.id}: video duration outside 60–120 seconds`);","const durationRange=release.filmDurationRange||{min:60,max:120};\n  assert(film.duration>=durationRange.min&&film.duration<=durationRange.max,`${l.id}: video duration outside the declared edition range`);")
 validator.write_text(code,encoding='utf-8')
 write(DEST/'edition.json',{'edition':'音乐重剪版','lessons':28,'comicPanels':168,'films':28,'shotsPerFilm':42,'filmSeconds':episodes[0]['duration'],'musicSha256':episodes[0]['musicSha256'],'audio':'supplied original AAC copied without voice or substitute music','publicDistributionLicense':'not verified; local delivery','sourceHash':technical[0]['sourceHash']})
 (DEST/'README.md').write_text('''# 心间漫游 · 音乐重剪版

28课、168格漫画、28支1080p60短片。每片约2分15秒，使用用户提供的完整AAC配乐，没有口播与替代配乐。动画直接渲染，没有OpenFilm可编辑工程约束。

Windows：双击START_WINDOWS.bat，或在本目录运行 `node scripts/serve.mjs`，再打开 http://127.0.0.1:4173 。需要Node.js 22或更新版本；网页应通过本地服务打开。

播放器点击后才请求MP4，支持分段加载、暂停、拖动、全屏、同步双语字幕、文字稿与错误重试。切换课程会停止旧播放器。

影片是知识解释与虚构校园情境，图形标有教学示意，不是实验原始录像或测量数据。出处和证据边界保留在逐课文字稿中。

配乐用于本次本地交付，公开同步与分发授权未核验。网站与自有工程的许可证不能覆盖附件音乐；不得把本说明理解为对音乐版权的授权保证。本版尚未完成独立教育效果评估、连续看审与全程听审，不给出“90分优秀验收”的结论。
''',encoding='utf-8')
 install(ROOT/'open-preview.mjs',DEST/'scripts/open-preview.mjs')
 (DEST/'START_WINDOWS.bat').write_bytes(b'@echo off\r\ncd /d "%~dp0"\r\nnode scripts\\open-preview.mjs\r\nif errorlevel 1 pause\r\n')
 # The launcher starts only this edition and leaves other preview services alone.

 files=sum(1 for p in DEST.rglob('*') if p.is_file());size=sum(p.stat().st_size for p in DEST.rglob('*') if p.is_file())
 write(ROOT/'review/site-assembly.json',{'directory':str(DEST),'files':files,'bytes':size,'films':28,'sourceHash':technical[0]['sourceHash']})
 print(json.dumps({'films':28,'files':files,'megabytes':round(size/1024**2,1)},ensure_ascii=False))

if __name__=='__main__':main()
