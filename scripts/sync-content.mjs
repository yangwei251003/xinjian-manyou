import fs from 'node:fs';import path from 'node:path';
import {webpDimensions} from './media-info.mjs';
const root=path.resolve(import.meta.dirname,'..');
const lessons=[];
const parts=fs.readdirSync(path.join(root,'content')).filter(name=>/^lessons-[a-z]\.json$/.test(name)).sort();
for(const part of parts)lessons.push(...JSON.parse(fs.readFileSync(path.join(root,'content',part),'utf8')));
fs.writeFileSync(path.join(root,'content/lessons.json'),JSON.stringify(lessons,null,2)+'\n');
const choose=(newPath,oldPath)=>fs.existsSync(path.join(root,newPath))?newPath:oldPath;
const media={_hero:{image:choose('assets/hero-v2.webp','assets/hero.webp')},_cast:{image:choose('assets/cast-v2.webp','assets/cast.webp')}};
const filmIndex=path.join(root,'production/films.json');
const films=fs.existsSync(filmIndex)?JSON.parse(fs.readFileSync(filmIndex,'utf8')):[];
for(const lesson of lessons){const panels=Array.from({length:lesson.panels.length},(_,i)=>`assets/panels/${lesson.id}/${String(i+1).padStart(2,'0')}.webp`);const p=`assets/comics/${lesson.id}.webp`;media[lesson.id]=panels.every(p=>fs.existsSync(path.join(root,p)))?{comic:panels[0],panels:panels.map((image,i)=>{const [width,height]=webpDimensions(fs.readFileSync(path.join(root,image)));return {image,width,height,textMode:lesson.panels[i].textMode||'baked',...(lesson.panels[i].bubbles?{bubbles:lesson.panels[i].bubbles}:{})};})}:fs.existsSync(path.join(root,p))?{comic:p}:{};}
for(const film of films){const src=`assets/videos/${film.id}/film.mp4`;if(media[film.id]&&fs.existsSync(path.join(root,src)))media[film.id].video={src,poster:`assets/videos/${film.id}/poster.webp`,meta:`assets/videos/${film.id}/script.json`,title:film.title,duration:film.duration};}
fs.writeFileSync(path.join(root,'assets/media.json'),JSON.stringify(media,null,2)+'\n');
console.log(`Synced ${lessons.length} lessons; ${Object.values(media).filter(x=>x.comic).length} comics; ${Object.values(media).filter(x=>x.video).length} published films; independent panel arrays included when complete.`);
