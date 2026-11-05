import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {webpDimensions} from './media-info.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const lessons=read('content/lessons.json');
const media=read('assets/media.json');
const library=read('content/library.json');
const catalog=read('content/catalog.json');
const panelHashes=new Set();
const errors=[];
const assert=(v,m)=>{if(!v)errors.push(m)};
const release=read('content/release.json');
const draft=process.argv.includes('--draft');
assert(lessons.length===release.lessons.length,'Lesson count must match the release roster');
const ids=new Set(lessons.map(x=>x.id));
assert(ids.size===lessons.length,'IDs must be unique');
for(const id of release.lessons)assert(ids.has(id),`Missing release lesson ${id}`);
const zones=['perception','body','emotion','self','social','life','health','science'];
for(const z of zones)assert(lessons.some(x=>x.zone===z),`Empty zone: ${z}`);
for(const l of lessons){
 assert(l.title&&l.summary&&l.takeaway&&l.boundary,`${l.id}: required prose missing`);
 assert(l.panels?.length===6,`${l.id}: expected six story panels`);
 for(const [i,p]of(l.panels||[]).entries())assert(p.dialogue&&p.caption&&p.visual,`${l.id} panel${i}: incomplete`);
 assert(l.explanation?.length>=3,`${l.id}: need three explanation sections`);
 assert(l.explanation?.every(x=>x.heading&&x.text?.length>=50),`${l.id}: explanations too short`);
 assert(l.sources?.length>=2,`${l.id}: need two source links`);
 for(const s of l.sources||[])assert(s.title&&/^https:\/\//.test(s.url)&&s.note,`${l.id}: source invalid`);
 assert(l.quiz?.options?.length>=3 && Number.isInteger(l.quiz.correct)&&l.quiz.correct>=0&&l.quiz.correct<l.quiz.options.length&&l.quiz.feedback,`${l.id}: quiz invalid`);
 for(const id of l.related||[])assert(ids.has(id)&&id!==l.id,`${l.id}: bad related ${id}`);
 assert(l.related?.length>=2,`${l.id}: need two connections`);
 assert(media[l.id]?.comic,`${l.id}: missing comic mapping`);
 assert(l.prediction?.question&&l.prediction.options?.length>=2&&l.prediction.options.every(o=>o.text&&o.feedback),`${l.id}: incomplete prediction`);
 assert(l.practice?.prompt&&l.practice.steps?.length>=2&&l.practice.example,`${l.id}: incomplete practice`);
 assert(l.mechanism?.steps?.length>=2&&l.mechanism.metaphorLimit,`${l.id}: incomplete mechanism`);
 assert(l.evidence?.level&&l.evidence.claim&&l.evidence.limits,`${l.id}: evidence needs claim and limits`);
 assert(l.misconception?.myth&&l.misconception.correction,`${l.id}: missing misconception`);
 for(const b of l.branches||[])assert(catalog.branches.some(x=>x.id===b),`${l.id}: unknown branch ${b}`);
 for(const sc of l.scenes||[])assert(catalog.scenes.some(x=>x.id===sc),`${l.id}: unknown scene ${sc}`);
 for(const ex of l.experimentIds||[])assert(catalog.experiments.some(x=>x.id===ex),`${l.id}: unknown experiment ${ex}`);
 const panels=media[l.id]?.panels;assert(Array.isArray(panels)&&panels.length===6,`${l.id}: requires six independently generated panel files, not a sheet`);
 for(const [i,entry]of (panels||[]).entries()){
  const image=typeof entry==='string'?entry:entry.image;assert(image===`assets/panels/${l.id}/${String(i+1).padStart(2,'0')}.webp`,`${l.id}: panel path must be independently indexed`);
  try{const data=fs.readFileSync(path.join(root,image));const size=webpDimensions(data);assert(size[0]>=1024&&size[1]>=1024,`${l.id} panel ${i+1}: must be a full-size standalone image`);const hash=createHash('sha256').update(data).digest('hex');assert(!panelHashes.has(hash),`${l.id} panel ${i+1}: duplicate image reused as a separate frame`);panelHashes.add(hash);}catch(error){assert(false,`${l.id} panel ${i+1}: cannot verify image: ${error.message}`);}
  if(typeof entry==='object'&&entry.textMode==='overlay')assert(entry.bubbles?.length&&entry.bubbles.every(b=>b.text&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.w)),`${l.id} panel ${i+1}: overlay needs explicit in-image bubble geometry`);
 }

 const film=media[l.id]?.video;
 if(!draft&&release.requireVideo)assert(film?.src,`${l.id}: missing published video`);
 if(film?.src){
  for(const field of ['src','poster','meta']){
   const file=film[field];assert(typeof file==='string'&&!file.startsWith('/')&&!file.includes('..')&&!/^https?:/.test(file),`${l.id}: invalid film ${field}`);
   if(file)assert(fs.existsSync(path.join(root,file)),`${l.id}: missing film ${field}`);
  }
  assert(film.duration>=60&&film.duration<=120,`${l.id}: video duration outside 60–120 seconds`);
  try{
   const script=read(film.meta);
   assert(script.id===l.id&&script.sources?.length>=2,`${l.id}: invalid video script identity or sources`);
   assert(script.cues?.length>=12,`${l.id}: incomplete bilingual storyboard`);
   for(const [i,cue]of script.cues.entries()){
    assert(cue.zh&&cue.en&&Number.isFinite(cue.start)&&cue.end>cue.start,`${l.id}: invalid cue ${i}`);
    assert(Math.abs(cue.start-(script.cues[i-1]?.end||0))<0.01,`${l.id}: subtitle gap or overlap at ${i}`);
   }
   assert(Math.abs(script.cues.at(-1).end-film.duration)<0.02,`${l.id}: subtitle duration mismatch`);
   const header=fs.readFileSync(path.join(root,film.src)).subarray(0,32);
   assert(header.includes(Buffer.from('ftyp')),`${l.id}: MP4 header missing`);
  }catch(error){assert(false,`${l.id}: video metadata check failed: ${error.message}`);}
 }

}
for(const [id,m]of Object.entries(media))for(const[k,p]of Object.entries(m)){
 if(typeof p!=='string')continue;
 assert(!p.startsWith('/')&&!p.includes('..')&&!/^https?:/.test(p),`${id}.${k}: media must be portable relative path`);
 assert(fs.existsSync(path.join(root,p)),`${id}.${k}: missing file ${p}`);
}
assert(library.books.length>=9,'Need at least 9 reading doors');
for(const obj of [...library.books,...library.people])for(const id of obj.lessons)assert(ids.has(id),`Library invalid lesson ${id}`);
for(const ex of catalog.experiments){assert(ex.name&&ex.question&&ex.procedure&&ex.finding&&ex.limits&&/^https:\/\//.test(ex.source?.url),`Incomplete experiment: ${ex.id}`);for(const id of ex.lessonIds||[])assert(ids.has(id),`Experiment references missing lesson ${id}`);}
const corpus=JSON.stringify(lessons);
assert(!/TODO|待补充|待研究整合|Lorem ipsum|example\.com/.test(corpus),'Placeholder text found');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`${draft?'DRAFT':'PASS'}: ${lessons.length} complete lessons, 8 zones, ${lessons.reduce((n,l)=>n+l.panels.length,0)} independent full-size story panels, ${Object.values(media).filter(m=>m.video?.src).length} published films, ${library.books.length} book doors; all indexed local media paths resolve.`);
