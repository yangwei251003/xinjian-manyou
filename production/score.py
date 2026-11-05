"""Original 76-BPM ambient scores, with separate music and action-accent stems."""
import argparse
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter,sosfilt

RATE=48000
ROOT=Path(__file__).resolve().parents[1]
PROJECTS=Path.home()/'Documents/VideoCreation/Projects/xinjian-manyou-v3'

def save(path,audio):
    peak=float(np.max(np.abs(audio)))
    if peak>0.94:audio=audio*(0.94/peak)
    data=np.round(np.clip(audio,-1,1)*32767).astype('<i2')
    path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),'wb') as handle:
        handle.setnchannels(2);handle.setsampwidth(2);handle.setframerate(RATE);handle.writeframes(data.tobytes())

def note(midi,length,kind,velocity=1):
    t=np.arange(round(length*RATE),dtype=np.float32)/RATE
    f=440*2**((midi-69)/12)
    if kind=='piano':
        env=(1-np.exp(-t*240))*np.exp(-t*1.8)
        a=sum(np.sin(2*np.pi*f*(h+0.0002*h*h)*t)*np.exp(-t*h*.16)/h**2 for h in range(1,7))
    elif kind=='pad':
        env=np.minimum(t/.65,1)*np.minimum((length-t)/1.1,1)
        a=(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*1.002*t)+.18*np.sin(2*np.pi*f*2*t))*.32
    elif kind=='bass':
        env=(1-np.exp(-t*20))*np.exp(-t*1.1)*np.minimum((length-t)/.08,1)
        a=np.sin(2*np.pi*f*t)+.15*np.sin(2*np.pi*f*2*t)
    else:
        env=np.exp(-t*9)*(1-np.exp(-t*180))
        a=np.sin(2*np.pi*f*t)+.17*np.sin(2*np.pi*f*3*t)
    return (a*env*velocity).astype(np.float32)

def place(track,sound,at,gain,pan=0):
    start=round(at*RATE)
    if start>=len(track):return
    data=sound[:len(track)-start]
    if len(data)==0:return
    gains=np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)],dtype=np.float32)
    track[start:start+len(data)]+=data[:,None]*gains*gain

def room(track):
    result=track.copy()
    for seconds,gain in ((.17,.17),(.29,.11),(.43,.08),(.61,.055)):
        n=round(seconds*RATE)
        result[n:]+=track[:-n,::-1]*gain
    return result

def score(film):
    duration=film['duration']
    beat=60/film['bpm'];bar=beat*4
    rng=np.random.default_rng(film['seed'])
    n=round(duration*RATE)
    music=np.zeros((n,2),np.float32)
    key=[50,48,52,45,53,47,55][(film['seed']-100)%7]
    progression=[0,-4,3,-2]
    contour=[0,7,10,7,3,12,10,5]
    shift=(film['seed']-100)%8
    for b in range(24):
        root=key+progression[(b//2)%4]
        at=b*bar
        energy=.68 if b<4 else (.9 if b<16 else (.78 if b<21 else .5))
        for k,interval in enumerate([0,3,7]):
            place(music,note(root+12+interval,bar*1.85,'pad'),at,.042*energy,(-.55,0,.55)[k])
        for k in range(4):
            place(music,note(root-12,beat*.8,'bass'),at+k*beat,.055*energy)
        for k in [0,1.5,3]:
            pitch=root+24+contour[(b+shift+int(k*2))%len(contour)]
            place(music,note(pitch,2.4,'piano'),at+k*beat,.052*energy,float(rng.uniform(-.5,.5)))
        # Low, rounded pulse. The slow frequency drop avoids a sharp click.
        t=np.arange(round(.18*RATE),dtype=np.float32)/RATE
        kick=np.sin(2*np.pi*(42*t+24*.035*(1-np.exp(-t/.035))))*np.exp(-t*25)*(1-np.exp(-t*360))
        for k in (0,2):place(music,kick,at+k*beat,.057*energy)
        if b>=4 and b<21:
            length=round(.07*RATE);noise=rng.normal(0,.24,length).astype(np.float32)
            filtered=sosfilt(butter(2,6500,fs=RATE,btype='highpass',output='sos'),noise)
            filtered*=np.exp(-np.arange(length)/RATE*75)
            for k in np.arange(.5,4,.5):place(music,filtered,at+k*beat,.027*energy,.3 if int(k*2)%2 else -.3)
    music=room(music)
    fade=np.minimum(np.arange(n)/(RATE*1.2),1)*np.minimum((n-1-np.arange(n))/(RATE*3.4),1)
    music*=fade[:,None]
    # One soft, low-level accent per structural change, on the downbeat.
    accent=note(81,.7,'accent',.5)
    effects=np.zeros_like(music)
    for scene in film['stages'][1:]:
        place(effects,accent,scene['start'],.018)
    music=np.tanh(music*1.8)*.8
    peak=float(np.max(np.abs(music+effects)))
    gain=min(.8/max(peak,1e-6),2.0)
    music*=gain;effects*=gain
    folder=PROJECTS/film['id']/'audio'
    save(folder/'music.wav',music)
    save(folder/'accent.wav',np.column_stack([accent,accent])*.018/.25*gain)
    save(folder/'effects.wav',effects)
    save(folder/'mix.wav',music+effects)
    return {'id':film['id'],'duration':duration,'peak_dbfs':20*np.log10(max(float(np.max(np.abs(music+effects))),1e-8)),'seed':film['seed'],'bpm':film['bpm'],'original_composition':True,'license':'CC BY 4.0','listening_review':'pending'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--id');args=p.parse_args()
    films=json.loads((ROOT/'production/films.json').read_text(encoding='utf-8'))
    reports=[]
    for film in films:
        if args.id and film['id']!=args.id:continue
        reports.append(score(film));print('Scored',film['id'],flush=True)
    (PROJECTS/'audio-technical.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':main()
