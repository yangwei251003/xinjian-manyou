"""Freeze supplied sound, licensed references and the existing lesson artwork."""
from pathlib import Path
import base64
import os
import hashlib
import json
import subprocess
import shutil
import time
import numpy as np
from scipy import signal
from scipy.io import wavfile
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parent
SITE=Path(os.environ.get('XINJIAN_SITE',str(ROOT.parents[1])))
FF=Path.home()/'AppData/Local/Programs/FFmpeg/8.1.2/ffmpeg-8.1.2-essentials_build/bin'
SOURCE=Path(os.environ.get('XINJIAN_AUDIO',str(ROOT/'assets/user-music.aac')))
def write(name,data):
 p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def github(repository,path,ref,dest):
 p=ROOT/'reference'/dest;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():raw=p.read_bytes()
 else:
  for attempt in range(3):
   result=subprocess.run(['gh','api',f'repos/{repository}/contents/{path}?ref={ref}'],capture_output=True)
   if result.returncode==0:break
   time.sleep(1)
  if result.returncode:raise RuntimeError('Reference download unavailable: '+path)
  raw=base64.b64decode(json.loads(result.stdout)['content']);p.write_bytes(raw)
 return {'path':str(p.relative_to(ROOT)),'url':f'https://github.com/{repository}/blob/{ref}/{path}','sha256':hashlib.sha256(raw).hexdigest()}
def main():
 (ROOT/'assets').mkdir(exist_ok=True)
 if SOURCE.resolve()!=(ROOT/'assets/user-music.aac').resolve():shutil.copy2(SOURCE,ROOT/'assets/user-music.aac')
 subprocess.run([str(FF/'ffmpeg.exe'),'-v','error','-y','-i',str(SOURCE),'-ac','1','-ar','22050',str(ROOT/'assets/analysis.wav')],check=True)
 sr,wav=wavfile.read(ROOT/'assets/analysis.wav');x=wav.astype(float)/32768
 frequencies,times,z=signal.stft(x,fs=sr,nperseg=2048,noverlap=1536)
 spectral=np.abs(z)
 flux=np.maximum(0,np.diff(np.log1p(spectral*300),axis=1))
 low=flux[(frequencies>=35)&(frequencies<=220)].sum(axis=0)
 broad=flux[(frequencies>=220)&(frequencies<=5000)].sum(axis=0)
 onset=low/max(np.max(low),1e-9)*.75+broad/max(np.max(broad),1e-9)*.25
 onset=signal.savgol_filter(onset,5,2);dt=times[1]-times[0];ot=times[1:]
 corr=signal.correlate(onset-onset.mean(),onset-onset.mean(),mode='full')[len(onset)-1:]
 lags=np.arange(int(60/95/dt),int(60/65/dt))
 lag=lags[np.argmax(corr[lags])];period=lag*dt
 # Refine the regular pulse and its phase against the actual spectral attacks.
 best=None
 for per in np.linspace(period-.025,period+.025,101):
  for phase in np.linspace(0,per,80,endpoint=False):
   grid=np.arange(phase,len(x)/sr,per)
   indices=np.clip(np.round(grid/dt).astype(int),0,len(onset)-1)
   score=np.mean(onset[indices])
   if best is None or score>best[0]:best=(score,per,phase)
 _,period,phase=best
 beats=[]
 for t in np.arange(phase,len(x)/sr,period):
  indices=np.where(np.abs(ot-t)<.11)[0]
  k=indices[np.argmax(onset[indices])] if len(indices) else np.argmin(abs(ot-t))
  beats.append({'time':float(ot[k]),'grid':float(t),'strength':float(onset[k])})
 offset=max(range(4),key=lambda i:np.mean([b['strength'] for b in beats[i::4]]))
 duration=len(x)/sr
 bars=[b for b in beats[offset::4] if 2<b['time']<duration-1.8]
 while len(bars)>41:bars.pop(min(range(len(bars)),key=lambda i:bars[i]['strength'] if i in (0,len(bars)-1) else 100))
 boundaries=[0]+[round(b['time']*60)/60 for b in bars]+[duration]
 write('music-analysis.json',{'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'duration':duration,'bpm':60/period,'pulse_phase':phase,'bar_offset':offset,'beats':beats,'cuts':boundaries,'method':'low-band weighted spectral flux, global pulse fit, local attack refinement; cuts quantized to 60fps','sound':'supplied AAC, unchanged AAC packets in export'})
 points=[{'time':round(i*4*dt,4),'value':round(float(v),4)} for i,v in enumerate(onset[::4])]
 write('assets/onset.json',points)
 refs=[]
 for name in ('DirectionalWipe','CircleOpen','Doorway','CrossZoom'):
  refs.append(github('gl-transitions/gl-transitions',f'transitions/{name}.glsl','0efa1651dfdbc0cdbd57f4cda55f12d8b3dbc0c5',f'gl/{name}.glsl'))
 for path in ('demos/effects/glow-flyline-moves/OrbFlylineRelay.tsx','demos/effects/assemble-then-type-flyin/AssembleThenTypeFlyin.tsx','demos/transition/circle-match-iris/CircleMatchIris.tsx','LICENSE'):
  refs.append(github('Vincentwei1021/video-shotcraft',path,'43bd349a136651865ecfa6ea1cf012f6e957d304','vincent/'+path.split('/')[-1]))
 write('reference/sources.json',refs)
 films=json.loads((SITE/'production/films.json').read_text(encoding='utf-8'))
 lessons=json.loads((SITE/'content/lessons.json').read_text(encoding='utf-8'))
 needed=set(json.dumps([films,lessons],ensure_ascii=False)+'信息差 事实 观察 解释 提问 线索 回到生活 分支 现场 机制推演 画面为教学示意 NOT A MEASUREMENT VIBE心理学')
 needed.update(chr(i) for i in range(32,127))
 for name in ('renderer.js','topic-scenes.js','build.py','narration.py'):
  if (ROOT/name).exists():needed.update((ROOT/name).read_text(encoding='utf-8'))
 font=TTFont(Path.home()/'Documents/VideoCreation/Resources/Fonts/NotoSansSC/NotoSansSC.ttf',recalcTimestamp=False)
 options=subset.Options();options.flavor='woff2';sub=subset.Subsetter(options=options);sub.populate(text=''.join(sorted(needed)));sub.subset(font);font.flavor='woff2';font.save(ROOT/'assets/FilmSans.woff2')
 fonts=Path.home()/'Documents/VideoCreation/Resources/Fonts'
 shutil.copy2(fonts/'NotoSansSC/LICENSE.txt',ROOT/'assets/NotoSansSC-OFL.txt')
 shutil.copy2(fonts/'anton/Anton-Regular.ttf',ROOT/'assets/Anton.ttf');shutil.copy2(fonts/'anton/LICENSE.txt',ROOT/'assets/Anton-OFL.txt')
 for lesson in lessons:
  target=ROOT/'assets/comics'/lesson['id'];target.mkdir(parents=True,exist_ok=True)
  for p in (SITE/'assets/panels'/lesson['id']).glob('*.webp'):shutil.copy2(p,target/p.name)
 write('lessons.json',lessons);write('original-scripts.json',films)
 print(json.dumps({'duration':duration,'bpm':60/period,'shots':len(boundaries)-1,'references':len(refs),'artwork':len(lessons)*6}))
if __name__=='__main__':main()
