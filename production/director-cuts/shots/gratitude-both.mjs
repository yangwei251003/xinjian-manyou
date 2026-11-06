import {W,H,PI,mix,phase,rng,fill,rect,round,poly,line,ellipse,clip,gradient,lit,grain,path,saved,T,withAlpha} from '../drawing.mjs';

const ink='#324957', paper='#f8e7c5', dark='#263d52', warm='#d5a263', rainBlue='#8caeb5';
const backdrop = new OffscreenCanvas(W,H);
const b = backdrop.getContext('2d');
fill(b,gradient(b,0,0,0,H,[[0,'#546e88'],[.5,'#7f9bac'],[1,'#485a69']]));
const random=rng(616);
for(let i=0;i<31;i++){
  const x=random()*W,y=70+random()*426,r=72+random()*146;
  ellipse(b,x,y,r,r*.65,lit(b,x,y,r,[[0,i%2?'#b5c6c270':'#3b5e7a55'],[1,'#bacfc000']]));
}
for(let i=0;i<15;i++){
  const x=i*115-32,w=75+random()*104,y=273+random()*194;
  rect(b,x,y,w,725-y,i%2?'#5e788c':'#688799');
  for(let j=0;j<3;j++)for(let k=0;k<4;k++)rect(b,x+10+j*27,y+26+k*38,13,16,(i+j+k)%6===0?'#d7b67b95':'#304d6160');
}
poly(b,[[0,620],[1600,592],[1600,900],[0,900]],'#607887');
line(b,[[0,663],[1600,631]],'#c2d1c0',7);
for(let i=0;i<33;i++){
  const x=random()*W,y=655+random()*225;
  ellipse(b,x,y,26+random()*95,3+random()*8,i%3?'#7f9eaa63':'#e1c78c51');
}
grain(b,793,.8);
const drops=Array.from({length:112},()=>[random()*W,random()*H,18+random()*34,.21+random()*.36]);
function rain(c,p,shelterX){
  drops.forEach(([x,y,len,op],i)=>{
    const yy=(y+p*(1230+i%4*50))%900;
    const xx=(x+p*150)%1600;
    const covered=yy>463&&yy<780&&Math.abs(xx-shelterX)<143;
    if(!covered)line(c,[[xx,yy],[xx-9,yy+len]],`rgba(223,239,234,${op})`,2);
  });
}
function canopy(c,x,y,s=1){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    path(c,'M-185 12 Q-153 -105 -20 -121 Q123 -132 191 12 Q130 -15 75 16 Q25 -12 -23 16 Q-77 -10 -122 17 Q-158 1 -185 12 Z','#d8ad73','#665d60',4);
    path(c,'M-122 16 Q-94 -95 -20 -121 M75 16 Q41 -90 -20 -121 M-23 16 Q-34 -71 -20 -121',null,'#ad8b68',2.7);
    path(c,'M-18 -120 L-16 147 Q-13 188 16 169',null,'#52616b',6);
  });
}
function person(c,x,y,s,coat,step=0){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    ellipse(c,0,19,64,13,'#374b5d72');
    line(c,[[-16,-63],[-23+step*17,2]],'#465363',19);
    line(c,[[15,-65],[19-step*12,0]],'#465363',19);
    round(c,-46,-150,88,102,35,coat);
    round(c,29,-144,30,84,13,'#735b63');
    ellipse(c,-6,-172,34,36,'#c29a83');
    path(c,'M-38 -161 Q-50 -208 -10 -209 Q27 -209 30 -171 Q-4 -173 -10 -188 Q-18 -167 -38 -161 Z','#404652');
  });
}
function bus(c,x,y,s){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    ellipse(c,8,6,310,31,'#344a5d66');
    round(c,-312,-201,624,179,39,'#a6b8b7','#425c6e',5);
    rect(c,-311,-86,619,27,'#bb947c');
    for(let i=0;i<6;i++)round(c,-277+i*91,-178,75,70,7,'#456273');
    rect(c,270,-175,35,78,'#607d8d');
    ellipse(c,-205,-17,42,37,'#324f60');ellipse(c,202,-18,42,37,'#324f60');
    rect(c,299,-67,14,16,'#ffe7a2');
  });
}
function diary(c,p,closing=false){
  fill(c,gradient(c,0,0,W,H,[[0,'#847a8a'],[1,'#4f6576']]));
  ellipse(c,811,588,642,183,'#263d514f');
  const a=closing?phase(p,.35,.82):phase(p,.05,.53);
  const right=closing?mix(1436,822,a):mix(890,1436,a);
  path(c,'M134 305 Q488 204 804 284 L804 727 Q474 626 117 699 Z','#efe3c7','#776f75',3);
  path(c,`M804 284 Q${(804+right)/2} 216 ${right} 310 L${right+18} 701 Q${(804+right)/2} 626 804 727 Z`,'#fbecd0','#776f75',3);
  line(c,[[804,285],[804,724]],'#ac9693',4);
  return a;
}
function wash(c,x,y,w,h,accent){
  clip(c,x,y,w,h,()=>{
    rect(c,x,y,w,h,'#a1b7bc');
    ellipse(c,x+w*.42,y+h*.63,w*.63,h*.77,lit(c,x+w*.42,y+h*.63,w*.6,[[0,accent],[1,'#779caf00']]));
    ellipse(c,x+w*.63,y+h*.78,w*.62,h*.32,'#65839468');
  });
}
export const shots={
  rainwalk(c,p){
    c.drawImage(backdrop,0,0);
    bus(c,mix(808,2077,phase(p,.02,.45)),653,1.09);
    const a=phase(p,.46,.86);
    person(c,648,727,1.22,'#ba796f');
    person(c,953,718,1.29,'#809b9c');
    canopy(c,mix(1002,796,a),448,1.24);
    rain(c,p,mix(1002,796,a));
    rect(c,0,0,W,183,gradient(c,0,0,0,183,[[0,'#26364caa'],[1,'#26364c00']]));
    T(c,'给今天留两个位置',97,134,81,'#fff1cf',{font:'StudioSerif',weight:850});
  },
  'two-pages'(c,p){
    const a=diary(c,p);
    wash(c,201,355,518,200,'#658eaa');
    T(c,'今天很难的部分',213,334,37,ink,{font:'StudioSerif'});
    T(c,'雨很大，错过了车。',219,628,39,ink,{font:'StudioSerif'});
    withAlpha(c,phase(a,.4,.95),()=>{
      wash(c,885,354,487,200,'#dcb180');canopy(c,1104,477,.53);
      T(c,'今天被照应的部分',885,334,37,ink,{font:'StudioSerif'});
      T(c,'有人把伞挪近一点。',887,624,39,ink,{font:'StudioSerif'});
    });
    T(c,'同一天，两件事',801,151,67,paper,{align:'center',font:'StudioSerif',weight:830});
    grain(c,796,.65);
  },
  detail(c,p){
    fill(c,'#d7c6b3');
    wash(c,77,163,708,567,'#95aeb7');
    const a=phase(p,.13,.75);
    canopy(c,468-103*a,447,1.02);
    person(c,419,692,1.1,'#b57a75');
    T(c,'把那一刻写具体',875,237,57,ink,{font:'StudioSerif',weight:850});
    clip(c,867,322,629*phase(p,.15,.82),313,()=>T(c,'他挪了半把伞。\n我的书包没再淋湿。',883,414,49,ink,{font:'StudioSerif',leading:1.6,max:608}));
    grain(c,797,.83);
  },
  experiment(c,p){
    fill(c,'#bbb7a8');
    T(c,'研究把记录任务分开比较',98,142,66,ink,{font:'StudioSerif',weight:850});
    const subjects=[['值得感谢的事','#c4bea2'],['遇到的烦恼','#a9b5bb'],['平常发生的事','#e2c7a2']];
    subjects.forEach(([title,tone],i)=>{
      const a=phase(p,.06+i*.15,.38+i*.15);
      saved(c,()=>{
        c.translate(98+i*495,242+50*(1-a));c.rotate((i-1)*.047);
        rect(c,10,13,399,422,'#35485a39');rect(c,0,0,399,422,paper);
        wash(c,25,117,349,210,tone);
        T(c,title,28,76,39,ink,{font:'StudioSerif',max:351});
        line(c,[[28,352],[370,352]],'#958b83',2);line(c,[[28,379],[328,379]],'#958b83',2);
      });
    });
    T(c,'实验一：每周记录 · Emmons & McCullough · 2003',1475,756,27,ink,{align:'right'});
    grain(c,800,.64);
  },
  optional(c,p){
    diary(c,1);
    T(c,'今晚可以留白',221,411,49,ink,{font:'StudioSerif'});
    for(let j=0;j<5;j++)line(c,[[885,382+j*58],[1382,400+j*52]],'#b0a18e72',2);
    const a=phase(p,.22,.71);
    saved(c,()=>{
      c.translate(1230+68*a,594-67*a);c.rotate(-.64);
      rect(c,-113,-13,197,24,'#426d6e');poly(c,[[84,-13],[115,0],[84,11]],'#ab9889');
    });
    T(c,'这是一个可以自己选择的练习',800,135,60,paper,{align:'center',font:'StudioSerif',weight:820});
  },
  'close-book'(c,p){
    diary(c,p,true);
    const a=phase(p,.1,.44);
    withAlpha(c,a,()=>T(c,'困难',415,493,64,ink,{align:'center',font:'StudioSerif',weight:820}));
    withAlpha(c,1-phase(p,.41,.68),()=>T(c,'支持',1110,491,64,ink,{align:'center',font:'StudioSerif',weight:820}));
    T(c,'都可以留下来',800,143,75,paper,{align:'center',font:'StudioSerif',weight:850});
    grain(c,801,.53);
  },
};
