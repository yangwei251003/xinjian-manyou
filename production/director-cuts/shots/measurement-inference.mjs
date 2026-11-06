import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,path,clip,grid,gradient,lit,arrow,grain,saved,T,withAlpha} from '../drawing.mjs';

const base='#153a68', blue='#92c9e3', white='#eef7e8', yellow='#f2ce75', pink='#e79890';
function blueprint(c){
  fill(c,gradient(c,0,0,W,H,[[0,'#224e7b'],[1,'#102a55']]));
  grid(c,34,'#a6d6dd28');grid(c,170,'#b0e2e340');
  round(c,36,36,1528,743,0,null,'#9ac9d7',2);
}
function calipers(c,x,y,length=490){
  rect(c,x,y,length,33,'#c2d9d6');
  for(let i=0;i<length/17;i++)line(c,[[x+14+i*17,y],[x+14+i*17,y+(i%5===0?22:12)]],'#426378',2);
  poly(c,[[x,y-4],[x+39,y-4],[x+39,y+165],[x-39,y+165],[x-39,y+130],[x,y+130]],blue);
  poly(c,[[x+length*.67,y-14],[x+length*.67+71,y-14],[x+length*.67+71,y+160],[x+length*.67+7,y+160],[x+length*.67+7,y+130],[x+length*.67+34,y+130],[x+length*.67+34,y+48],[x+length*.67,y+48]],'#739db4');
}
function scale(c,x,y,s,reading){
  saved(c,()=>{c.translate(x,y);c.scale(s,s);
    round(c,-262,-30,524,267,28,'#5e8cab',white,4);
    round(c,-244,-127,488,108,13,'#b4d1d7','#e3ebdb',3);
    poly(c,[[-175,-109],[116,-109],[181,-144],[-123,-144]],'#f4d994');
    rect(c,-175,-108,292,39,'#d5ad68');poly(c,[[117,-109],[181,-144],[181,-104],[117,-69]],'#b88758');
    T(c,'练习册',-31,-77,22,base,{align:'center'});
    round(c,-172,52,344,113,15,'#223f5d',blue,3);
    T(c,reading,0,133,76,yellow,{align:'center',weight:820});
    ellipse(c,-207,170,11,11,blue);ellipse(c,208,170,11,11,blue);
  });
}
const lobes='M52 218 C16 164 49 99 106 95 C105 35 188 7 240 39 C290 7 364 33 385 79 C458 61 520 106 512 172 C556 202 536 267 493 291 C485 343 429 368 372 342 C339 395 253 385 226 346 C146 376 91 337 95 299 C50 292 27 249 52 218 Z';
function brain(c,x,y,s,mask,p){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    path(c,lobes,'#254c74',blue,5);
    path(c,'M237 38 C225 113 296 105 278 178 C256 238 291 260 252 345 M112 98 Q196 75 215 154 M67 227 Q137 193 206 238 M293 126 Q360 109 398 155 M325 233 Q430 212 491 286 M166 267 Q187 303 209 326 M394 81 Q416 111 407 132',null,'#7baed0',4);
    if(mask){
      const hotspots=[[370,170,93],[197,241,67]];
      hotspots.slice(0,mask).forEach(([xx,yy,r])=>{
        const color=lit(c,xx,yy,r*phase(p,.07,.71)+.01,[[0,'#ffe287'],[.39,'#e7916ccf'],[1,'#df776100']]);
        ellipse(c,xx,yy,r,r,color);
      });
    }
  });
}
export const shots={
  gauge(c,p){
    blueprint(c);
    T(c,'测得稳，真的测对了吗',86,137,79,white,{weight:850});
    const values=['212 g','211 g','212 g'];
    scale(c,596,424+Math.sin(phase(p,.09,.68)*PI*3)*16,1.08,values[Math.min(2,Math.floor(p*3.45))]);
    [212,211,212].forEach((v,i)=>withAlpha(c,phase(p,.08+i*.2,.34+i*.2),()=>{
      const y=319+i*124;
      line(c,[[1062,y],[1450,y]],'#85bad0',2);
      T(c,`第 ${i+1} 次`,1064,y-19,31,blue);
      T(c,`${v} g`,1452,y-19,48,yellow,{align:'right',weight:890});
    }));
    T(c,'信度 · 一致性示意',100,726,39,white);
  },
  'wrong-tool'(c,p){
    blueprint(c);
    T(c,'这个仪器能回答哪个问题？',92,127,68,white,{weight:850});
    saved(c,()=>{
      c.translate(1039,427);c.scale(1,.62);
      round(c,-419,-281,838,562,280,'#476a82',blue,5);
      for(let i=1;i<5;i++)round(c,-419+24*i,-281+24*i,838-48*i,562-48*i,280-24*i,null,'#b0c8cc',3);
      round(c,-285,-144,570,288,138,'#264f66',blue,3);
    });
    scale(c,371,429,.76,'212 g');
    const a=phase(p,.2,.74);
    line(c,[[752,517],[752+565*a,517]],yellow,6,[19,10]);
    T(c,'跑道长度 ？',1058,451,61,yellow,{align:'center'});
    T(c,'测得的量：质量',373,726,35,white,{align:'center'});
    T(c,'想回答的量：距离',1052,727,35,white,{align:'center'});
  },
  validity(c,p){
    blueprint(c);
    calipers(c,434,362,767);
    const a=phase(p,.22,.83);
    arrow(c,495,634,495+555*a,634,yellow,5);
    T(c,'效度',91,148,110,white,{weight:880});
    T(c,'证据能支持什么用途？',96,223,55,blue);
    T(c,'解释',434,729,45,white);T(c,'使用者',790,729,45,white);T(c,'用途',1163,729,45,white);
  },
  scan(c,p){
    blueprint(c);
    T(c,'同一亮区可以出现在不同任务',86,137,68,white,{weight:880});
    brain(c,218,217,.99,1,p);
    brain(c,877,217,.99,2,Math.max(0,(p-.24)*1.4));
    T(c,'任务 A',500,672,43,white,{align:'center'});T(c,'任务 B',1151,672,43,white,{align:'center'});
    T(c,'脑成像比较的教学示意',1480,752,29,blue,{align:'right'});
  },
  inverse(c,p){
    blueprint(c);
    brain(c,131,253,.99,1,1);
    const a=phase(p,.22,.75);
    for(const [i,label] of ['任务 A','任务 B','其他可能'].entries()){
      const y=266+i*165;
      arrow(c,763,465,mix(765,1157,a),mix(465,y,a),i===0?yellow:blue,4);
      withAlpha(c,a,()=>T(c,label,1236,y+13,46,white));
    }
    T(c,'从亮区倒推任务，需要更多证据',87,141,69,white,{weight:840});
    T(c,'反向推断 · Poldrack, 2006',1458,739,28,blue,{align:'right'});
  },
  'instrument-tags'(c,p){
    blueprint(c);
    const a=phase(p,.16,.76);
    T(c,'每次读数，都带着一个问题',85,142,70,white,{weight:870});
    calipers(c,133,368,489);
    brain(c,961,249,.87,1,p);
    rect(c,674,201,248,517,'#153a68e8');
    line(c,[[798,273],[798,273+411*a]],yellow,3,[9,12]);
    T(c,'它测到了什么？',127,698,53,white);
    T(c,'能支持什么推断？',1459,698,53,white,{align:'right'});
  },
};
