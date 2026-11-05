"""Portable local edition: 14 coherent films explicitly cover 28 lesson pages."""
from pathlib import Path
import json, os, shutil, hashlib, sys
ROOT=Path(__file__).resolve().parent
SITE=Path.home()/'Desktop/心理学启蒙可视化平台/心间漫游-完整运行版/xinjian-manyou'
DEST=ROOT/'website'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def install(source,target,binary=False):
 target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():
  if source.read_bytes()==target.read_bytes():return
  target.unlink()
 if binary:
  try:os.link(source,target);return
  except OSError:pass
 shutil.copy2(source,target)
def main():
 assert DEST.resolve().parent==ROOT.resolve()
 films=read(ROOT/'episodes.json');lessons={l['id']:l for l in read(ROOT/'lessons.json')}
 prepare='--prepare' in sys.argv
 technical=[]
 if not prepare:
  for f in films:
   report=read(ROOT/'export'/f['id']/'technical.json');assert report['frames']==8112
   assert hashlib.sha256((ROOT/'export'/f['id']/'film.mp4').read_bytes()).hexdigest()==report['fileHash']
   technical.append(report)
  assert len({r['sourceHash'] for r in technical})==1
 for directory in ['src','assets','content','scripts','tests']:
  for source in (SITE/directory).rglob('*'):
   if source.is_file() and source.relative_to(SITE).parts[:2]!=('assets','videos'):
    install(source,DEST/source.relative_to(SITE),source.suffix in {'.webp','.png','.jpg','.ttf','.woff2'})
 for name in ['index.html','LICENSE','CONTENT-LICENSE.md','package.json','start.sh','.nojekyll']:
  install(SITE/name,DEST/name)
 media=read(SITE/'assets/media.json');collection=[]
 for f in films:
  fid=f['id'];folder=ROOT/'export'/fid;web=DEST/'assets/videos'/fid
  for name in ['film.mp4','poster.webp','subtitles.vtt','分镜与来源.md']:
   if (folder/name).exists():install(folder/name,web/name,name in ['film.mp4','poster.webp'])
  script={**f,'edition':'narrative-rebuild','lessonIds':f['lessons']}
  write(web/'script.json',script)
  facts={'id':fid,'lessonFacts':[{**lessons[l]['evidence'],'lessonId':l,'core_claim':lessons[l]['evidence']['claim'],'evidence_limits':lessons[l]['evidence']['limits'],'mechanism':lessons[l]['mechanism'],'sources':lessons[l]['sources']} for l in f['lessons']]}
  write(web/'facts.json',facts);write(folder/'facts.json',facts)
  entry={'src':f'assets/videos/{fid}/film.mp4','poster':f'assets/videos/{fid}/poster.webp','meta':f'assets/videos/{fid}/script.json','title':f['question'],'duration':f['duration'],'filmId':fid,'relatedLessons':f['relatedLessons'],'collection':True}
  for lid in f['lessons']:media[lid]['video']=entry
  collection.append(entry)
 write(DEST/'assets/media.json',media);write(DEST/'assets/film-collection.json',collection)
 release=read(DEST/'content/release.json');release.update({'edition':'narrative-rebuild','filmDurationRange':{'min':60,'max':150},'videoPolicy':'shared-related-concepts','filmCount':14});write(DEST/'content/release.json',release)
 validator=DEST/'scripts/validate-content.mjs';code=validator.read_text(encoding='utf-8')
 code=code.replace('assert(film.duration>=60&&film.duration<=120,`${l.id}: video duration outside 60–120 seconds`);','const r=release.filmDurationRange||{min:60,max:120};assert(film.duration>=r.min&&film.duration<=r.max,`${l.id}: duration outside declared range`);')
 code=code.replace('assert(script.id===l.id&&script.sources?.length>=2,`${l.id}: invalid video script identity or sources`);','const shared=release.videoPolicy===\'shared-related-concepts\';assert((shared?script.id===film.filmId&&script.lessonIds?.includes(l.id):script.id===l.id)&&script.sources?.length>=2,`${l.id}: invalid video coverage or sources`);')
 code=code.replace("const facts=read(path.join(path.dirname(film.meta),'facts.json'));","const factTable=read(path.join(path.dirname(film.meta),'facts.json'));const facts=shared?{...factTable.lessonFacts?.find(f=>f.lessonId===l.id),id:l.id}:factTable;")
 validator.write_bytes(code.encode('utf-8'))
 filmsjs=DEST/'src/films.js';code=filmsjs.read_text(encoding='utf-8')
 if 'class="film-connections"' not in code:code=code.replace('<p>${timeLabel(film.duration)} · 双语字幕 · 器乐配乐</p>','<p>${timeLabel(film.duration)} · 双语字幕 · 器乐配乐</p>\n      ${film.relatedLessons?.length?`<p class="film-connections">本片关联：${film.relatedLessons.map(l=>`<a href="#/story/${encodeURIComponent(l.id)}">${e(l.title)}</a>`).join(\' · \')}</p>`:\'\'}\n      ${film.collection?\'<p><a href="films.html">浏览全部 14 支短片 ↗</a></p>\':\'\'}')
 filmsjs.write_bytes(code.encode('utf-8'))
 install(ROOT/'films.html',DEST/'films.html');install(ROOT/'gallery.js',DEST/'src/gallery.js');install(ROOT/'tests/films.test.mjs',DEST/'tests/films.test.mjs')
 install(ROOT/'open-preview.mjs',DEST/'scripts/open-preview.mjs')
 (DEST/'START_WINDOWS.bat').write_bytes(b'@echo off\r\ncd /d "%~dp0"\r\nnode scripts\\open-preview.mjs\r\nif errorlevel 1 pause\r\n')
 package=read(DEST/'package.json');package.update({'version':'3.2.0','scripts':{'start':'node scripts/serve.mjs','dev':'node scripts/serve.mjs','validate':'node scripts/validate-content.mjs','test':'node --test tests/frontend.test.mjs tests/interactions.test.mjs tests/stroop.test.mjs tests/films.test.mjs'}});write(DEST/'package.json',package)
 write(DEST/'edition.json',{'edition':'心理学叙事重制版','lessons':28,'comicPanels':168,'films':14,'cues':336,'filmSeconds':135.2,'musicSha256':films[0]['musicSha256'],'sourceHash':technical[0]['sourceHash'] if technical else 'preparing-narrative-rebuild','publicMusicLicense':'unverified; local edition only'})
 (DEST/'README.md').write_bytes(('''# 心间漫游 · 心理学叙事重制版

28篇独立漫画课程、168格漫画、14支串联短片。视频独立讲述，相关知识合并在同一问题下展开；不按漫画对话拼接视频。每支约2分15秒，1920×1080、60fps，使用用户原始AAC配乐，没有口播。

Windows 双击 START_WINDOWS.bat。需要 Node.js 22 或更新版本。也可运行 node scripts/serve.mjs 后打开 http://127.0.0.1:4173/films.html 。本包可离线运行，不能直接双击网页文件。

短片目录为 films.html，每课也保留播放器。点击才请求MP4，支持暂停、拖动、全屏、双语同步字幕、文字稿和重试。课程收藏继续沿用同一浏览器本地存储。

配乐公开同步和分发许可未核实，本版仅本地交付。图形为教学示意，不是实验原始录像或个体诊断结果。完整一手出处与边界见逐片文字稿。脚本已独立审读；教育效果、专业心理学审读及所有影片完整主观看听仍有待进一步验证，不给出90分优秀结论。
''').encode('utf-8'))
 print(json.dumps({'films':14,'lessons':28,'preparedOnly':prepare,'directory':str(DEST)},ensure_ascii=False))
if __name__=='__main__':main()
