"""Inspect the delivered files, not just the animation recipe."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parent
FF=Path.home()/'AppData/Local/Programs/FFmpeg/8.1.2/ffmpeg-8.1.2-essentials_build/bin'
def run(name,args):
 p=subprocess.run([str(FF/name),*args],capture_output=True)
 if p.returncode:raise RuntimeError(p.stderr.decode('utf-8','replace'))
 return p.stdout
def pcm_hash(file):
 p=subprocess.Popen([str(FF/'ffmpeg.exe'),'-v','error','-threads','1','-i',str(file),'-map','0:a:0','-c:a','pcm_s16le','-f','s16le','-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 h=hashlib.sha256();size=0
 while b:=p.stdout.read(1024*1024):h.update(b);size+=len(b)
 assert p.wait()==0
 return {'sha256':h.hexdigest(),'bytes':size}
def one(episode):
 folder=ROOT/'export'/episode['id'];movie=folder/'film.mp4';report=folder/'technical.json'
 if not movie.exists() or not report.exists():return {'id':episode['id'],'status':'not_ready'}
 try:
  data=json.loads(report.read_text(encoding='utf-8'))
  assert data['fileHash']==hashlib.sha256(movie.read_bytes()).hexdigest()
  probe=json.loads(run('ffprobe.exe',['-v','error','-show_streams','-show_format','-of','json',str(movie)]))
  video=next(s for s in probe['streams'] if s['codec_type']=='video')
  assert (video['width'],video['height'],video['r_frame_rate'])==(1920,1080,'60/1')
  assert int(video['nb_frames'])==8112
  assert abs(float(probe['format']['duration'])-episode['duration'])<.05
  audio=pcm_hash(movie);assert audio==original,'Audio differs from the supplied source'
  if '--decode' in sys.argv:
   run('ffmpeg.exe',['-v','error','-threads','1','-i',str(movie),'-map','0:v:0','-an','-f','null','-'])
  return {'id':episode['id'],'status':'pass','width':1920,'height':1080,'fps':60,'frames':8112,'audioPcm':audio,'fullVideoDecode':'--decode' in sys.argv,'bytes':movie.stat().st_size,'sourceHash':data['sourceHash']}
 except Exception as error:return {'id':episode['id'],'status':'fail','error':str(error)}
original=pcm_hash(ROOT/'assets/user-music.aac')
episodes=json.loads((ROOT/'episodes.json').read_text(encoding='utf-8'))
reports=list(ThreadPoolExecutor(max_workers=2).map(one,episodes))
write={'sourceAudio':original,'results':reports,'continuousVisualReview':False,'fullListeningReview':False}
(ROOT/'review/export-check.json').write_text(json.dumps(write,ensure_ascii=False,indent=2),encoding='utf-8')
counts={key:sum(r['status']==key for r in reports) for key in ['pass','fail','not_ready']};print(json.dumps(counts))
if counts['fail'] or counts['not_ready'] and '--available' not in sys.argv:sys.exit(1)
