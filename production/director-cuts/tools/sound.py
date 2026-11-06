"""Compose original, scene-timed effects and sparse instrumental beds."""
from pathlib import Path
import json
import subprocess
import sys
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RATE = 44100
FILMS = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {films} from './film-plan.mjs'; process.stdout.write(JSON.stringify(films));"], cwd=ROOT))

# Each motif is separately composed. Workshop, court, and chalk leave the
# observation stretches open for effects and thinking time.
SCORES = {
    'court': (0, 1, [], 'pluck'),
    'film': (45, 1.67, [0, 7, 3, 0, -2, 5, 2, None], 'reed'),
    'desk': (55, 1.32, [0, 4, 7, None, 2, 9, 7, 4, 0, None, 5, 2], 'felt'),
    'stage': (43, 2.8, [0, 3, 10, 5, 7, 12, 9, 5], 'bow'),
    'gallery': (57, .86, [0, 7, 12, None, 4, 9, 16, 7, 2, 5, None, 9], 'felt'),
    'trail': (50, 1.18, [0, 7, 12, 14, 9, 7, None, 4, 2, 7, 9, 16], 'pluck'),
    'workshop': (0, 1, [], 'felt'),
    'chalk': (0, 1, [], 'felt'),
    'press': (53, .73, [0, None, 5, 7, 0, None, 10, 7, 3, 8, None, 12], 'reed'),
    'arcade': (56, .31, [0, 3, 7, 10, None, 5, 3, None, 0, 7, 12, None, 10, 8, 5, 3], 'pulse'),
    'lab': (47, 2.07, [0, None, 7, 2, 5, 12, None, 9, 4, 7], 'sine'),
    'campus': (58, 1.07, [0, 4, None, 9, 7, 2, 5, 12, 7, None, 4, 2], 'mallet'),
    'cutout': (51, 1.6, [0, 5, 7, None, 3, 8, 12, 7, 3, 0], 'pluck'),
    'rain': (49, 2.43, [0, 7, 14, None, 9, 16, 12, 7, 4, None, 2, 0], 'felt'),
}

# Event times within each shot are fractions of its run time, matching the
# authored motion phases. The pass times come from the ball's actual arrivals.
EVENTS = {
    'court': {'tipoff':[(.23,'tap')],'passing':[(t/12,'bounce') for t in [.5,1.56,2.9,3.26,4.86,5.3,6.86,7.7,8.56,10.1,10.66]],'reveal':[(.10,'bell')],'aperture':[(.08,'sweep')],'transfer':[(.66,'bell')]},
    'film': {'collision':[(.61,'crash')],'wording':[(.21,'paper'),(.60,'paper')],'afterweek':[(.61,'stamp')],'splice':[(.47,'reel')],'check':[(.52,'reel')]},
    'desk': {'fold':[(.59,'paper')],'recall':[(.22,'scratch'),(.56,'paper')],'comparison':[(.40,'clock'),(.72,'clock')],'habit':[(.71,'paper')],'night':[(.30,'clock')],'next-day':[(.34,'bell')]},
    'stage': {'curtain':[(.21,'heartbeat'),(.35,'heartbeat'),(.51,'sweep')],'two-scenes':[(.46,'heartbeat')],'pressure':[(.49,'stamp')],'new-reading':[(.55,'sweep')],'move-prop':[(.62,'tap')]},
    'gallery': {'portrait':[(.38,'shutter')],'pullback':[(.34,'reel')],'situations':[(.33,'shutter'),(.71,'shutter')],'spectrum':[(.55,'paper')],'crop':[(.65,'shutter')]},
    'trail': {'trailhead':[(.25,'step'),(.53,'step')],'secure-base':[(.32,'step'),(.71,'step')],'bridge':[(.36,'tap'),(.50,'tap'),(.65,'tap')],'ask':[(.46,'paper')],'lookout':[(.56,'bell')]},
    'workshop': {'jam':[(.56,'clank')],'turntable':[(.36,'reel')],'attribution':[(.50,'tap')],'hidden-key':[(.57,'sweep')],'listen':[(.51,'tap')],'unlock':[(.71,'latch')]},
    'chalk': {'riddle':[(.09,'scratch'),(.25,'scratch'),(.43,'scratch')],'positive':[(.45,'stamp')],'counterexample':[(.52,'bell')],'reveal-rule':[(.27,'scratch')],'line-study':[(.31,'tap'),(.56,'tap')],'answer-alone':[(.46,'scratch')]},
    'press': {'ticket':[(.39,'paper')],'flip':[(.47,'sweep')],'ink':[(.46,'stamp')],'package':[(.52,'paper')],'two-choices':[(.33,'paper')],'both-sides':[(.54,'stamp')]},
    'arcade': {'insert':[(.23,'coin'),(.38,'coin'),(.53,'coin')],'locked':[(.48,'latch')],'fork':[(.31,'game'),(.63,'game')],'refund':[(.65,'coin')],'reset':[(.51,'game')],'credits':[(.53,'bell')]},
    'lab': {'gauge':[(.23,'clock'),(.44,'clock'),(.65,'clock')],'wrong-tool':[(.5,'tap')],'scan':[(.34,'sweep'),(.71,'sweep')],'inverse':[(.51,'clock')],'instrument-tags':[(.52,'latch')]},
    'campus': {'campus':[(.31,'bell')],'sample':[(.43,'shutter')],'day-log':[(.17,'tap'),(.37,'tap'),(.57,'tap')],'scatter':[(.30,'mallet'),(.47,'mallet'),(.64,'mallet')],'heat':[(.39,'sweep')],'replicate':[(.48,'paper')],'field-notes':[(.58,'paper')]},
    'cutout': {'request':[(.45,'paper')],'budget':[(.49,'reel')],'trim':[(.55,'snip')],'adjust':[(.32,'tap'),(.58,'tap')],'stop':[(.52,'step')],'agreed':[(.57,'stamp')]},
    'rain': {'rainwalk':[(.56,'sweep')],'two-pages':[(.49,'paper')],'detail':[(.38,'scratch')],'experiment':[(.41,'paper')],'optional':[(.61,'scratch')],'close-book':[(.60,'paper')]},
}

def envelope(t, length, attack, release):
    return np.minimum(1,t/max(attack,1e-5))*np.minimum(1,np.maximum(0,(length-t)/release))

def note(midi, length, kind):
    t = np.arange(int(length*RATE))/RATE
    phase = 2*np.pi*440*2**((midi-69)/12)*t
    fundamental = np.sin(phase)
    if kind == 'felt':
        return (fundamental + .22*np.sin(2.01*phase)*np.exp(-3*t)+.07*np.sin(3.98*phase))*np.exp(-1.7*t)*envelope(t,length,.018,.22)
    if kind == 'pluck':
        return (fundamental + .31*np.sin(2*phase)*np.exp(-4*t)+.13*np.sin(3*phase)*np.exp(-7*t))*np.exp(-2.6*t)*envelope(t,length,.011,.19)
    if kind == 'mallet':
        return (fundamental+.19*np.sin(4.02*phase)*np.exp(-8*t))*np.exp(-3.2*t)*envelope(t,length,.006,.24)
    if kind == 'pulse':
        return (fundamental+.22*np.sin(3*phase)+.08*np.sin(5*phase))*np.exp(-3.5*t)*envelope(t,length,.014,.10)
    if kind == 'reed':
        return (fundamental+.18*np.sin(2*phase)+.09*np.sin(3*phase))*envelope(t,length,.10,.42)*(.83+.17*np.sin(2*np.pi*3.4*t))
    if kind == 'bow':
        return (np.sin(phase+.07*np.sin(t*24))+.11*np.sin(2*phase))*envelope(t,length,.85,.9)
    return fundamental*envelope(t,length,.29,.58)

def effect(kind, rng):
    length = {'bell':1.2,'sweep':.73,'reel':.65,'paper':.55,'crash':.71,'heartbeat':.55}.get(kind,.30)
    t = np.arange(int(length*RATE))/RATE
    noise = rng.standard_normal(len(t))
    high = noise - np.roll(noise, 1)
    if kind in ('bell','coin','game','mallet'):
        midi = {'bell':79,'coin':85,'game':74,'mallet':71}[kind]
        return note(midi,length,'mallet' if kind in ('bell','mallet') else 'pulse')
    if kind == 'heartbeat':
        return (np.sin(2*np.pi*53*t)*np.exp(-19*t)+.55*np.sin(2*np.pi*46*t)*np.exp(-35*np.maximum(t-.18,0))*(t>.18))*envelope(t,length,.012,.12)
    if kind in ('bounce','crash','clank','stamp','latch','tap','step','clock','shutter'):
        freq = {'bounce':107,'crash':59,'clank':470,'stamp':113,'latch':317,'tap':260,'step':76,'clock':810,'shutter':503}[kind]
        decay = {'crash':8,'bounce':13,'clank':20}.get(kind,33)
        return (np.sin(2*np.pi*freq*t)*.75+.19*np.sin(2*np.pi*freq*2.57*t)+high*.16)*np.exp(-decay*t)*envelope(t,length,.004,.065)
    if kind == 'sweep':
        return (.17*high+.48*np.sin(2*np.pi*(124*t+143*t*t)))*np.sin(np.pi*t/length)**2
    if kind == 'reel':
        return (.25*high+.16*np.sin(2*np.pi*119*t))*(.5+.5*np.sin(2*np.pi*21*t))*envelope(t,length,.09,.15)
    return high*.26*envelope(t,length,.025,.13)*(.6+.4*np.cos(t*(109 if kind=='scratch' else 54)))

def compose(film, index):
    seconds = film['duration']
    rng = np.random.default_rng(5173+index*117)
    audio = np.zeros((seconds*RATE,2), dtype=np.float32)

    def place(t, samples, volume, pan=0):
        first = max(0,int(t*RATE))
        n = min(len(samples),len(audio)-first)
        if n > 0:
            audio[first:first+n] += samples[:n,None]*volume*np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)])

    theme = film['sound']
    root, interval, motif, instrument = SCORES[theme]
    if motif:
        for i, start in enumerate(np.arange(.5,seconds-.7,interval)):
            semitone = motif[i%len(motif)]
            if semitone is None:
                continue
            duration = min(seconds-start, max(.27, interval*(1.85 if theme!='arcade' else .95)))
            place(start, note(root+semitone+12,duration,instrument), .087 if theme!='stage' else .112, -.19 if i%2 else .19)
            if i%4==0 and theme not in ('arcade','press'):
                duration = min(seconds-start, interval*3.8)
                place(start,note(root+semitone,duration,'bow' if theme in ('stage','rain') else 'felt'),.063)
    if theme in ('rain','trail','film','court'):
        t = np.arange(len(audio))/RATE
        noise = rng.standard_normal(len(audio))
        band = np.convolve(noise, np.ones(9)/9, mode='same')
        place(0,band*(.79+.21*np.sin(t*.64)),{'rain':.115,'trail':.06,'film':.037,'court':.031}[theme])
    for scene in film['shots']:
        for j,(fraction,name) in enumerate(EVENTS[theme].get(scene['id'],[])):
            place(scene['start']+fraction*scene['seconds'],effect(name,rng), .24 if name in ('crash','clank','coin','bell') else .173, -.23 if j%2 else .23)
    fade_in = int(.18*RATE)
    fade_out = int(1.10*RATE)
    audio[:fade_in] *= np.linspace(0,1,fade_in)[:,None]
    audio[-fade_out:] *= np.linspace(1,0,fade_out)[:,None]
    peak = float(np.max(np.abs(audio)))
    if peak > .66:
        audio *= .66/peak
    out = ROOT / 'mix' / (film['id']+'.wav')
    out.parent.mkdir(exist_ok=True)
    with wave.open(str(out),'wb') as file:
        file.setnchannels(2)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(np.asarray(audio*32767,dtype='<i2').tobytes())
    print(f"{film['id']}: {seconds}s, peak {20*np.log10(np.max(np.abs(audio))):.1f} dBFS",flush=True)

for index, film in enumerate(FILMS):
    if len(sys.argv)==1 or film['id'] in sys.argv[1:]:
        compose(film,index)
