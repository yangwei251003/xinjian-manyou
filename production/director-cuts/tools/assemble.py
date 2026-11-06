"""Assemble the finished cuts into a separately testable museum release."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'director-cuts-20261106'
ASSET_DIR = 'assets/director-films'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name+'.partial')
    temporary.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode())
    temporary.replace(path)

def digest(file):
    return hashlib.file_digest(file.open('rb'),'sha256').hexdigest()

def format_vtt(seconds):
    ms = round(seconds*1000)
    return f'{ms//3600000:02}:{(ms//60000)%60:02}:{(ms//1000)%60:02}.{ms%1000:03}'

def assemble(site, destination):
    if not (site/'content/lessons.json').is_file() or not (site/'src/films.js').is_file():
        raise ValueError('The site root must be the Heart Museum repository')
    original = read(site/'production/narrative/episodes.json')
    source_groups = {f['id']:f for f in original}
    lessons = {lesson['id']:lesson for lesson in read(site/'content/lessons.json')}
    films = json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {films} from './film-plan.mjs'; process.stdout.write(JSON.stringify(films));"],cwd=ROOT))
    verification = read(ROOT/'review/technical-checks.json')
    verified = {v['film']:v for v in verification['films']}
    covered = []
    for film in films:
        folder = ROOT/'export'/film['id']
        record = read(folder/'technical.json')
        expected_hash = verified[film['id']]['fileHash']
        if digest(folder/'film.mp4') != expected_hash or record['seconds'] != film['duration']:
            raise ValueError(f"Verification is stale for {film['id']}")
        covered.extend(source_groups[film['id']]['lessons'])
    if sorted(covered) != sorted(lessons):
        raise ValueError('Each published lesson must occur in one finished film')

    destination.mkdir(parents=True, exist_ok=True)
    for name in ('src','content','scripts','tests'):
        shutil.copytree(site/name,destination/name,dirs_exist_ok=True)
    shutil.copytree(site/'assets',destination/'assets',dirs_exist_ok=True,
        ignore=shutil.ignore_patterns('videos','director-films'))
    for name in ('index.html','films.html','.nojekyll','LICENSE','CONTENT-LICENSE.md','package.json','START_WINDOWS.bat','start.sh'):
        shutil.copy2(site/name,destination/name)
    media = read(destination/'assets/media.json')
    index = []
    for film in films:
        previous = source_groups[film['id']]
        source = ROOT/'export'/film['id']
        relative = f"{ASSET_DIR}/{film['id']}"
        output = destination/relative
        output.mkdir(parents=True,exist_ok=True)
        for name in ('film.mp4','poster.webp'):
            shutil.copy2(source/name,output/name)
        story = {
            'id':film['id'],'title':film['title'],'style':film['style'],'duration':film['duration'],
            'edition':VERSION,'lessonIds':previous['lessons'],'cues':film['cues'],'sources':previous['sources'],
        }
        write(output/'script.json',story)
        facts = []
        for lesson_id in previous['lessons']:
            lesson = lessons[lesson_id]
            facts.append({'lessonId':lesson_id,'core_claim':lesson['evidence']['claim'],
                'evidence_limits':lesson['evidence']['limits'],'mechanism':lesson['mechanism'],'sources':lesson['sources']})
        write(output/'facts.json',{'id':film['id'],'lessonFacts':facts})
        cues = ['WEBVTT','']
        for cue in film['cues']:
            cues.extend([f"{format_vtt(cue['start'])} --> {format_vtt(cue['end'])}",cue['zh'],cue['en'],''])
        (output/'subtitles.vtt').write_bytes('\n'.join(cues).encode())
        entry = {'src':relative+'/film.mp4','poster':relative+'/poster.webp','meta':relative+'/script.json',
            'title':film['title'],'duration':film['duration'],'filmId':film['id'],'style':film['style'],
            'color':film['color'],'relatedLessons':previous['relatedLessons'],'collection':True}
        index.append(entry)
        for lesson in previous['lessons']:
            media[lesson]['video'] = entry
    write(destination/'assets/film-collection.json',index)
    write(destination/'assets/media.json',media)
    release = read(destination/'content/release.json')
    release.update({'edition':VERSION,'version':'3.3.0','videoPolicy':'shared-related-concepts',
        'filmCount':len(films),'filmDurationRange':{'min':45,'max':100},'minFilmCues':5})
    write(destination/'content/release.json',release)
    edition_hash = hashlib.sha256(''.join(v['fileHash'] for v in verification['films']).encode()).hexdigest()
    write(destination/'edition.json',{'edition':'原创动画版','editionId':VERSION,'lessons':len(lessons),
        'films':len(films),'framesPerSecond':30,'sourceHash':edition_hash})
    print(f'{len(films)} films, {len(covered)} lessons assembled at {destination}')

if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('--site',required=True,type=Path)
    cli.add_argument('--out',default=ROOT/'website',type=Path)
    options = cli.parse_args()
    if options.out.resolve() == options.site.resolve():
        cli.error('Stage the release in a separate directory first')
    assemble(options.site.resolve(),options.out.resolve())
