import { W,H,PI,mix,phase,saved,fill,rect,round,poly,line,ellipse,clip,grain,rng,arrow,T,withAlpha,gradient } from '../drawing.mjs';

const ink = '#342925', cream = '#f5e2b5', red = '#b34e35', teal = '#3a7673';
function sedan(c,x,y,angle,color) {
  saved(c,()=>{
    c.translate(x,y);c.rotate(angle);
    ellipse(c,5,21,132,40,'#22181661');
    for(const dx of [-81,80]) for(const dy of [-38,38])round(c,dx-23,dy-11,46,22,6,'#322e2a');
    round(c,-125,-39,250,78,22,color,ink,3);
    poly(c,[[-65,-29],[47,-29],[67,-21],[67,21],[47,29],[-65,29],[-80,17],[-80,-17]],'#dab798',ink,3);
    poly(c,[[30,-27],[53,-27],[65,-18],[65,18],[53,27],[30,27]],'#394943');
    rect(c,-66,-24,22,48,'#3d514c');
    rect(c,115,-27,7,14,cream);rect(c,115,12,7,14,cream);
  });
}
function road(c,x,y,w,h,first,second) {
  clip(c,x,y,w,h,()=>{
    rect(c,x,y,w,h,'#c9ae7f');
    poly(c,[[x,y+h*.3],[x+w,y+h*.15],[x+w,y+h*.8],[x,y+h*.97]],'#726b61');
    line(c,[[x,y+h*.65],[x+w,y+h*.48]],'#e8d5a2',4,[35,25]);
    const r=rng(1982);
    for(let i=0;i<34;i++)ellipse(c,x+r()*w,y+12+r()*h*.17,14+r()*28,8+r()*12,'#766c47');
    saved(c,()=>{c.translate(x,y);c.scale(w/1100,h/480);sedan(c,first,273,-.1,teal);sedan(c,second,273,PI-.1,red);});
  });
}
function spool(c,x,y,w,h,scale=1) {
  rect(c,x-19*scale,y-41*scale,w+38*scale,h+82*scale,ink);
  for(let i=0;i<Math.floor(w/(54*scale));i++)for(const row of [y-29*scale,y+h+12*scale])round(c,x+i*54*scale,row,27*scale,18*scale,4*scale,'#dcbe89');
}
function slip(c,x,y,w,h,rot,tint,heading,body) {
  saved(c,()=>{
    c.translate(x,y);c.rotate(rot);
    rect(c,-w/2+11,12,w,h,'#563a2a34');
    rect(c,-w/2,0,w,h,tint);
    line(c,[[-w/2+24,82],[w/2-24,82]],'#7b55447f',2);
    T(c,heading,-w/2+27,54,32,ink,{font:'StudioSerif',weight:830,max:w-55});
    T(c,body,-w/2+27,136,37,red,{font:'StudioSerif',leading:1.4,max:w-55});
  });
}
export const shots = {
  collision(c,p) {
    fill(c,'#251e1d');
    const a = phase(p,.11,.61);
    const bounce = phase(p,.61,.75);
    spool(c,100,197,1400,500);
    road(c,100,197,1400,500,mix(180,444,a)-28*bounce,mix(965,699,a)+24*bounce);
    if(p>.59&&p<.69)withAlpha(c,Math.sin((p-.59)/.10*PI),()=>{
      for(let i=0;i<9;i++){
        const angle=i/9*PI*2;
        line(c,[[810+32*Math.cos(angle),476+24*Math.sin(angle)],[810+105*Math.cos(angle),476+77*Math.sin(angle)]],'#ffedb8',5);
      }
    });
    T(c,'同一声碰撞，两种回忆',106,114,67,cream,{font:'StudioSerif',weight:850});
    T(c,'重绘事故片段',1474,746,26,'#e7cfa4',{align:'right'});
    grain(c,209,.87);
  },
  wording(c,p) {
    fill(c,'#d9b988');
    spool(c,88,180,782,430,.7);
    road(c,88,180,782,430,426,718);
    slip(c,1166,125+95*(1-phase(p,0,.34)),493,192,-.07,'#efe1bb','提问纸条 A','两车碰到时……');
    slip(c,1178,413+95*(1-phase(p,.28,.72)),499,200,.06,'#f5d0a3','提问纸条 B','两车猛撞时……');
    T(c,'同一画面',475,694,34,ink,{align:'center',font:'StudioSerif'});
    T(c,'Loftus & Palmer · 1974',91,109,31,ink,{weight:600});
    grain(c,210,.77);
  },
  afterweek(c,p) {
    fill(c,'#dbcfad');
    const day=Math.min(7,1+Math.floor(p*12));
    for(let i=0;i<7;i++){
      const left=95+i*195;
      rect(c,left,94,171,86,i<day?red:'#c5b993');
      T(c,`第 ${i+1} 天`,left+85,150,28,i<day?cream:ink,{align:'center'});
    }
    slip(c,790,251,1050,438,-.021,'#f2e9cd','实验二 · 一周后追问','你看见碎玻璃了吗？');
    const reveal=phase(p,.48,.88);
    withAlpha(c,reveal,()=>{
      saved(c,()=>{
        c.translate(1002,493);c.rotate(-.14);
        round(c,-350,-47,700,112,10,null,red,8);
        T(c,'原影片里没有碎玻璃',0,31,48,red,{align:'center',font:'StudioSerif',weight:900});
      });
    });
    grain(c,211,.82);
  },
  splice(c,p) {
    fill(c,'#453733');
    const move=phase(p,.12,.78);
    const pieces = [[-450,-.21,'原来看到的',teal],[0,.09,'后来听到的',red],[460,.28,'自己的推断','#c88843']];
    pieces.forEach(([dx,a,label,color],i)=>{
      const x=800+dx*(1-move*.54);
      saved(c,()=>{
        c.translate(x,370+i*53);c.rotate(a*(1-move));
        rect(c,-228,-130,456,270,'#261d1b');
        rect(c,-208,-109,416,204,color);
        if(i===0){sedan(c,-35,-12,0,'#e5cd8e');}
        if(i===1){T(c,'“猛撞”',0,8,68,'#fff3cf',{align:'center',font:'StudioSerif'});}
        if(i===2){poly(c,[[-70,35],[-15,-58],[20,1],[66,-51],[100,39]],'#ffe1b7');}
        T(c,label,0,125,27,cream,{align:'center'});
      });
    });
    T(c,'记忆像一次重新剪接',95,124,59,cream,{font:'StudioSerif',weight:800});
    grain(c,212,.75);
  },
  calibrate(c,p) {
    fill(c,'#f0dfb7');
    const angle=mix(-.9,.54,phase(p,.13,.61));
    ellipse(c,480,437,253,252,'#e4cda0',ink,5);
    for(let i=0;i<13;i++) {
      const a=-2.8+2.5*i/12;
      line(c,[[480+180*Math.cos(a),437+180*Math.sin(a)],[480+222*Math.cos(a),437+222*Math.sin(a)]],i%3===0?red:ink,5);
    }
    line(c,[[480,437],[480+186*Math.cos(angle-PI/2),437+186*Math.sin(angle-PI/2)]],red,14);
    ellipse(c,480,437,22,22,ink);
    T(c,'自我把握',480,574,47,ink,{align:'center',font:'StudioSerif'});
    slip(c,1118,242+80*(1-phase(p,.26,.75)),587,369,.051,'#fbefd4','核对记录','照片、时间、原话');
    T(c,'元认知',89,102,69,red,{font:'StudioSerif',weight:870});
    grain(c,213,.9);
  },
  check(c,p) {
    fill(c,'#e0cb9d');
    const wipe=phase(p,.15,.73);
    slip(c,589,202,921,463,-.057,'#f9ebcd','先记录自己的印象','我记得……');
    clip(c,848,161,624*wipe,493,()=>{
      spool(c,853,205,604,400,.58);
      road(c,853,205,604,400,440,710);
    });
    line(c,[[884,655],[1442,655]],red,5);
    T(c,'再对照当时的材料',1451,718,38,ink,{align:'right',font:'StudioSerif'});
    grain(c,214,.7);
  },
};
