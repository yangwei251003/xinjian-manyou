"""Decode the complete release, inspect streams and loudness, and prepare review frames."""
import argparse
import hashlib
import io
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
TIMES=(.9,8,27,44,58,72)

def run(command):
    return subprocess.run(command,capture_output=True,check=True)

def inspect(film,out):
    id=film['id']
    movie=ROOT/f'assets/videos/{id}/film.mp4'
    data=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]).stdout)
    video=next(s for s in data['streams'] if s['codec_type']=='video')
    audio=next(s for s in data['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'],video['avg_frame_rate'])==(1920,1080,'60/1'),id
    assert video['codec_name']=='h264' and audio['codec_name']=='aac' and audio['sample_rate']=='48000',id
    assert abs(float(data['format']['duration'])-film['duration'])<.04,id
    decoded=run(['ffmpeg','-v','error','-threads','2','-i',str(movie),'-f','null','-'])
    assert not decoded.stderr,id+' emitted a decode warning'
    contact=Image.new('RGB',(1440,600),'#0a0e1a')
    draw=ImageDraw.Draw(contact)
    for i,time in enumerate(TIMES):
        picture=run(['ffmpeg','-v','error','-threads','1','-ss',str(time),'-i',str(movie),'-frames:v','1','-vf','scale=480:270','-f','image2pipe','-vcodec','png','-threads','1','pipe:1']).stdout
        contact.paste(Image.open(io.BytesIO(picture)),((i%3)*480,(i//3)*300))
        draw.text(((i%3)*480+8,(i//3)*300+277),f'{id} / {time}s',fill='#c9a96e')
    contact.save(out/f'{id}.jpg',quality=90)
    loud=run(['ffmpeg','-hide_banner','-nostats','-threads','1','-i',str(movie),'-vn','-af','ebur128=peak=true','-f','null','-']).stderr.decode(errors='replace')
    tail=loud[loud.rfind('Summary:'):]
    integrated=re.search(r'I:\s*(-?[\d.]+)\s*LUFS',tail)
    peak=re.search(r'Peak:\s*(-?[\d.]+)\s*dBFS',tail)
    report={'id':id,'bytes':movie.stat().st_size,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'width':1920,'height':1080,'fps':'60/1','frames':int(video['nb_frames']),'duration':float(data['format']['duration']),'audio':{'codec':'AAC','sample_rate':48000,'channels':audio['channels'],'lufs':float(integrated.group(1)) if integrated else None,'true_peak_dbfs':float(peak.group(1)) if peak else None},'full_decode':'pass','sample_times':TIMES,'review':'contact sheet prepared; continuous visual and listening review tracked separately'}
    print('Verified',id,flush=True)
    return report

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',type=Path,default=Path.home()/'Documents/VideoCreation/Projects/xinjian-manyou-v3/review/films')
    p.add_argument('--workers',type=int,default=3)
    args=p.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    films=json.loads((ROOT/'production/films.json').read_text(encoding='utf-8'))
    with ThreadPoolExecutor(max_workers=max(1,min(4,args.workers))) as pool:
        reports=list(pool.map(lambda f:inspect(f,args.out),films))
    assert len({r['sha256'] for r in reports})==len(films),'duplicate film'
    (ROOT/'docs/media-technical-v3.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'PASS: {len(reports)} complete H264/AAC films decoded and media reports written.')
if __name__=='__main__':main()
