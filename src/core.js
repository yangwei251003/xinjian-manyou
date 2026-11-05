export const ZONES = [
  {id:'perception',name:'感知与思考',en:'PERCEPTION',short:'看见，不一定看懂',desc:'注意、记忆与思考，藏着理解世界的第一把钥匙。',color:'#237c76',paper:'#d9f0e7',icon:'eye'},
  {id:'body',name:'身体与大脑',en:'BODY & MIND',short:'听见身体的消息',desc:'从睡眠到压力，看见身体与心智的相互联系。',color:'#4169a5',paper:'#dfeaff',icon:'wave'},
  {id:'emotion',name:'情绪与行动',en:'FEELING & DOING',short:'给感受留一个位置',desc:'理解情绪，试着改变解释与行动的可能。',color:'#bc4b39',paper:'#ffe3d7',icon:'sun'},
  {id:'self',name:'自我与成长',en:'SELF & GROWTH',short:'成为自己，不必定型',desc:'从人格、比较与依恋，重新认识变化中的自己。',color:'#7556a4',paper:'#ede2ff',icon:'sprout'},
  {id:'social',name:'人与人',en:'BETWEEN US',short:'换个位置，再看彼此',desc:'误会、倾听与群体：关系里的另一种视角。',color:'#a94e63',paper:'#ffe4eb',icon:'people'},
  {id:'life',name:'生活里的选择',en:'EVERYDAY CHOICES',short:'在选择之前，停一停',desc:'从消费到学习，让日常判断多一个观察角度。',color:'#85630c',paper:'#fff0b8',icon:'paths'},
  {id:'health',name:'困扰与支持',en:'CARE & SUPPORT',short:'不必一个人想明白',desc:'理解边界、支持与求助，不给自己或他人下诊断。',color:'#267566',paper:'#dbf2e6',icon:'heart'},
  {id:'science',name:'心理学如何知道',en:'THE SCIENCE',short:'带着好奇，也带着问题',desc:'从相关、样本到复现，看见知识如何被检验。',color:'#5659a6',paper:'#e5e6ff',icon:'glass'}
];
export const ZONE_BY_ID=Object.fromEntries(ZONES.map(z=>[z.id,z]));
export function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function safeURL(value){try{const u=new URL(value); return ['https:','http:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
export function parseRoute(hash=''){
  const input=hash.replace(/^#/,'')||'/';const [path,query='']=input.split('?');const params=new URLSearchParams(query);
  const segments=path.split('/').filter(Boolean).map(s=>{try{return decodeURIComponent(s);}catch{return s;}});
  return {name:segments[0]||'home',id:segments[1]||'',params};
}
export function exploreURL({zone='',q='',branch='',scene='',bookmarked=false}={}){const p=new URLSearchParams();if(zone)p.set('zone',zone);if(q)p.set('q',q);if(branch)p.set('branch',branch);if(scene)p.set('scene',scene);if(bookmarked)p.set('saved','1');return '#/explore'+(p.size?'?'+p:'');}
const searchKey=value=>value.normalize('NFKC').toLocaleLowerCase();

function lessonSearchText(lesson,catalog){
  const branches=lesson.branches||[lesson.branch];
  const scenes=lesson.scenes||[];
  return searchKey([
    lesson.title,lesson.question,lesson.summary,lesson.takeaway,ZONE_BY_ID[lesson.zone]?.name,
    ...(lesson.tags||[]),...(lesson.aliases||[]),...branches,...scenes,
    ...(catalog.branches||[]).filter(x=>branches.includes(x.id)).map(x=>x.name),
    ...(catalog.scenes||[]).filter(x=>scenes.includes(x.id)).map(x=>x.name),
    ...(catalog.experiments||[]).filter(x=>(x.lessonIds||[]).includes(lesson.id)).map(x=>x.name),
    ...(lesson.explanation||[]).flatMap(x=>[x.heading,x.text]),
    ...(lesson.panels||[]).flatMap(x=>[x.caption,x.dialogue]),
    ...(lesson.mechanism?.steps||[]),
  ].join(' '));
}

export function filterLessons(lessons,{zone='',q='',branch='',scene='',saved=null,catalog={}}={}){
  const terms=searchKey(q.trim()).split(/\s+/).filter(Boolean);
  return lessons.filter(lesson=>{
    if(zone&&lesson.zone!==zone || branch&&!(lesson.branches||[lesson.branch]).includes(branch)
      || scene&&!(lesson.scenes||[]).includes(scene) || saved&&!saved.includes(lesson.id))return false;
    if(!terms.length)return true;
    const text=lessonSearchText(lesson,catalog);
    return terms.every(term=>text.includes(term));
  });
}
export function normalizeLessons(raw){
  const arr=Array.isArray(raw)?raw:raw.lessons;
  if(!Array.isArray(arr))throw new Error('内容格式不正确');
  const seen=new Set();return arr.map(l=>{
    if(!l.id||seen.has(l.id)||!ZONE_BY_ID[l.zone]||!Array.isArray(l.panels)||l.panels.length<4||l.panels.length>8)throw new Error('主题数据缺失或重复：'+(l.id||'未命名'));
    seen.add(l.id);return {...l,tags:l.tags||[],sources:l.sources||[],related:l.related||[],duration:l.duration||6,explanation:l.explanation||[]};
  });
}
export function readCollection(storage){try{const r=JSON.parse(storage.getItem('xinjian.collection.v1')||'{}');return {saved:Array.isArray(r.saved)?r.saved.filter(x=>typeof x==='string'):[],read:Array.isArray(r.read)?r.read.filter(x=>typeof x==='string'):[]};}catch{return {saved:[],read:[]};}}
export function toggleValue(arr,id){return arr.includes(id)?arr.filter(v=>v!==id):[...arr,id];}
export function comicPosition(i){return `${i%2?100:0}% ${i>1?100:0}%`;}
export function resolveMedia(media,id){const m=media[id]||{}; return typeof m==='string'?{comic:m}:m;}
export const FEATURED_IDS=['attribution','attachment','reappraisal','boundaries','memory','framing'];
export const PATHS=[
 {title:'从一场误会开始',description:'先看见自己的推断，再试着倾听对方。',ids:['attribution','listening','boundaries'],label:'关系漫游'},
 {title:'给自己一点空间',description:'从比较到情绪，再认识多面的自己。',ids:['comparison','reappraisal','personality'],label:'自我漫游'},
 {title:'让好奇走得更远',description:'观察认知，再问一句：我们怎么知道？',ids:['memory','correlation','replication'],label:'科学漫游'}
];

// A background uses the original bitmap; only the visible layout window changes.
export function panelGeometry(metadata,index,count=4){
  const rows=Math.ceil(count/2);const fallback=[index%2/2,Math.floor(index/2)/rows,index%2/2+.5,(Math.floor(index/2)+1)/rows];
  const candidate=metadata?.normalized?.[index];
  const valid=Array.isArray(candidate)&&candidate.length===4&&candidate.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&candidate[2]>candidate[0]&&candidate[3]>candidate[1];
  const [left,top,right,bottom]=valid?candidate:fallback;
  const width=right-left,height=bottom-top;
  const size=metadata?.size;
  const sourceRatio=Array.isArray(size)&&size[0]>0&&size[1]>0?size[0]/size[1]:1;
  return {aspectRatio:width*sourceRatio/height,sizeX:100/width,sizeY:100/height,positionX:width===1?0:100*left/(1-width),positionY:height===1?0:100*top/(1-height)};
}
