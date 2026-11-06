"""Decode the actual releases and compare visual compositions without labels."""
from concurrent.futures import ThreadPoolExecutor
from itertools import combinations
from pathlib import Path
import hashlib
import json
import os
import subprocess

from PIL import Image, ImageDraw
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get('FFMPEG', str(Path.home()/'AppData/Local/Programs/FFmpeg/8.1.2/ffmpeg-8.1.2-essentials_build/bin/ffmpeg.exe'))
REVIEW = ROOT/'review'
FILMS = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {films} from './film-plan.mjs'; process.stdout.write(JSON.stringify(films));"],cwd=ROOT))

def ffmpeg(*args):
    return subprocess.check_output([FFMPEG,'-hide_banner','-v','error',*map(str,args)])

def inspect(film):
    name = film['id']
    folder = ROOT/'export'/name
    source = folder/'film.mp4'
    record = json.loads((folder/'technical.json').read_text(encoding='utf-8'))
    video = next(s for s in record['probe']['streams'] if s['codec_type']=='video')
    audio = next(s for s in record['probe']['streams'] if s['codec_type']=='audio')
    with source.open('rb') as file:
        sha = hashlib.file_digest(file,'sha256').hexdigest()
    assert sha==record['fileHash']
    assert (video['width'],video['height'],video['avg_frame_rate'],video['codec_name'])==(1920,1080,'30/1','h264')
    assert audio['codec_name']=='aac'
    assert abs(float(video['duration'])-film['duration'])<.04
    assert abs(float(audio['duration'])-film['duration'])<.04
    # Frames are scaled only after full H.264 decode. Lower captions are masked
    # for the movement comparison, while the full frame is checked for black.
    decoded=ffmpeg('-threads',2,'-i',source,'-map','0:v:0','-vf','scale=80:45:flags=area',
        '-pix_fmt','rgb24','-f','rawvideo','-')
    frames=np.frombuffer(decoded,np.uint8).reshape(-1,45,80,3)
    assert len(frames)==film['duration']*30
    assert np.sum(np.max(frames,axis=(1,2,3))<12)==0
    pcm=ffmpeg('-i',source,'-map','0:a:0','-ac',1,'-ar',12000,'-f','f32le','-')
    samples=np.frombuffer(pcm,'<f4')
    peak=float(np.max(np.abs(samples)))
    assert .015<peak<.99
    shot_results=[]
    graphics=[]
    frames_folder=REVIEW/name
    for index, shot in enumerate(film['shots'],1):
        samples_at=[int((shot['start']+shot['seconds']*p)*30) for p in (.03,.29,.59,.87)]
        stamps=frames[samples_at,:38].astype(np.float32)/255
        change=max(float(np.mean(np.abs(a-b))) for a,b in combinations(stamps,2))
        item=Image.open(frames_folder/f"{index}-{shot['id']}-graphics.png").convert('RGB')
        small=np.asarray(item.resize((64,36),Image.Resampling.LANCZOS),dtype=np.float32)/255
        graphics.append((name,shot['id'],small))
        shot_results.append({'shot':shot['id'],'start':shot['start'],'end':shot['end'],'sampledChange':round(change,4)})
    print(f"Decoded {name}: {len(frames)} frames, {len(shot_results)} scenes, {source.stat().st_size//1024} KiB",flush=True)
    return ({'film':name,'title':film['title'],'duration':film['duration'],'frames':len(frames),'fileHash':sha,
        'bytes':source.stat().st_size,'peakMonoDbfs':round(20*np.log10(peak),2),'shots':shot_results,
        'captions':len(film['cues']),'decode':True},graphics)

with ThreadPoolExecutor(max_workers=3) as pool:
    checks = list(pool.map(inspect,FILMS))
reports = [record for record,_ in checks]
frames = [frame for _,items in checks for frame in items]
ranked=[]
for (a,sa,img_a),(b,sb,img_b) in combinations(frames,2):
    if a==b:
        continue
    ranked.append((float(np.mean(np.abs(img_a-img_b))),a,sa,b,sb))
ranked.sort()
assert ranked[0][0]>.008, 'Review the near-identical cross-film frames'
code_ids={hashlib.sha256((ROOT/'shots'/(f['id']+'.mjs')).read_bytes()).hexdigest() for f in FILMS}
assert len(code_ids)==len(FILMS)
report={'filmCount':len(FILMS),'sceneCount':len(frames),'captionCount':sum(f['captions'] for f in reports),
    'filmDuration':[min(f['duration'] for f in reports),max(f['duration'] for f in reports)],
    'crossFilmTextFreePairsCompared':len(ranked),'closestPairs':[list(x) for x in ranked[:5]],
    'independentSceneFiles':len(code_ids),'sourceFootageUsed':False,'fullDecode':True,
    'humanWatchThrough':False,'humanFullMixListen':False,'films':reports}
report['lowMotionCandidates']=[f"{film['film']}/{shot['shot']}" for film in reports for shot in film['shots'] if shot['sampledChange']<.002]
(REVIEW/'technical-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

hero=[1,0,0,1,1,2,1,2,2,2,3,0,2,0]
for label,without_words in [('graphics-comparison',True),('scene-comparison',False)]:
    montage=Image.new('RGB',(1504,928),'#e9e5d8')
    draw=ImageDraw.Draw(montage)
    for i,(film,j) in enumerate(zip(FILMS,hero)):
        scene=film['shots'][j]
        file=REVIEW/film['id']/f"{j+1}-{scene['id']}{'-graphics' if without_words else ''}.png"
        picture=Image.open(file).convert('RGB')
        picture.thumbnail((364,205),Image.Resampling.LANCZOS)
        x=8+i%4*374;y=8+i//4*232
        montage.paste(picture,(x,y))
        draw.text((x,y+207),f"{i+1:02} {film['id']}",fill='#253531')
    montage.save(REVIEW/(label+'.jpg'),quality=94)
print(json.dumps({k:v for k,v in report.items() if k!='films'},ensure_ascii=False,indent=2))
