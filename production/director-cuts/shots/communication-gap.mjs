import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,gradient,grid,grain,arrow,saved,T,withAlpha} from '../drawing.mjs';

const coal='#313b34', green='#a9c24d', red='#e96548', fog='#e3e6d0', metal=['#c1c6b9','#7d897b','#a6b1a0'];
function shop(c,bright=false){
  fill(c,gradient(c,0,0,W,H,[[0,bright?'#e8e9d6':'#25342e'],[1,bright?'#b7c3b2':'#4c6053']]));
  grid(c,43,bright?'#4e675025':'#c2cfb123');
}
function device(c, {x=823,y=533,angle=.49,s=1,slider=-207,lane=79,wall=1,mark=true}){
  const cos=Math.cos(angle), sin=Math.sin(angle), faces=[];
  const point=([px,py,z])=>[x+(px*cos-py*sin)*s,y+((px*sin+py*cos)*.46-z)*s,px*sin+py*cos+z*.08];
  function slab(x1,y1,z1,x2,y2,z2,colors,layer=1){
    const vertices=[[x1,y1,z1],[x2,y1,z1],[x2,y2,z1],[x1,y2,z1],[x1,y1,z2],[x2,y1,z2],[x2,y2,z2],[x1,y2,z2]].map(point);
    [[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach((face,i)=>{
      const points=face.map(j=>vertices[j]);
      faces.push({points,color:colors[i===0?0:i%2?1:2],layer,depth:points.reduce((a,v)=>a+v[2],0)/4});
    });
  }
  ellipse(c,x+16,y+63,380*s,155*s,'#0c18164a');
  slab(-299,-169,-23,299,169,12,metal,0);
  for(const v of [-63,79]){
    slab(-238,v-27,13,248,v+27,19,['#535f54','#36463a','#7a8579']);
    slab(-238,v-32,18,248,v-27,35,metal);
    slab(-238,v+27,18,248,v+33,35,metal);
  }
  if(mark)slab(-165,-144,13,-94,-102,19,[red,'#b84336','#dd6352']);
  for(let i=0;i<7;i++)slab(-184+i*57,-18,13,-181+i*57,-5,15,['#424a40','#424a40','#424a40']);
  slab(41,54,18,64,105,58,['#536256','#374438','#758474']);
  if(wall>0)slab(-254,-88,18,-2,-74,18+173*wall,['#9aa597','#7e8b7e','#606d61']);
  slab(slider-56,lane-22,19,slider+52,lane+22,70,['#c9d960','#839d35','#a8bb49']);
  slab(slider+16,lane-22,68,slider+36,lane-2,79,['#f9e495','#888a46','#e2d571']);
  faces.sort((a,b)=>a.layer-b.layer||a.depth-b.depth).forEach(({points,color})=>poly(c,points,color,'#303c3460',1.5));
  return point;
}
function warning(c,x,y,label) {
  poly(c,[[x,y-44],[x+40,y+33],[x-40,y+33]],red);
  T(c,'!',x,y+23,43,'#fff1cc',{align:'center',weight:900});
  T(c,label,x+64,y+19,34,'#fff6d4');
}
function bolt(c,x,y,r=24){
  poly(c,Array.from({length:6},(_,i)=>[x+r*Math.cos(i*PI/3),y+r*Math.sin(i*PI/3)]),'#8c9b87','#414d42',3);
  ellipse(c,x,y,r*.44,r*.44,'#414d42');
}
export const shots={
  jam(c,p){
    shop(c);
    const a=phase(p,.16,.56);
    const point=device(c,{x:851,y:522,angle:.48,s:1.44,slider:mix(-188,-15,a)});
    T(c,'站到他那一边',96,157,86,'#f2f7d2',{weight:890});
    T(c,'一次滑块卡住后的观察',104,219,31,'#ccdcba');
    const [x,y]=point([59,80,79]);
    withAlpha(c,phase(p,.48,.68),()=>warning(c,x+58,y-50,'卡住了'));
    T(c,'示意工坊 / 操作视角',1485,732,29,'#d0debf',{align:'right'});
    grain(c,721,.56);
  },
  turntable(c,p){
    shop(c,true);
    ellipse(c,800,536,574,176,null,'#6d8c6e',4);
    const a=mix(2.99,.48,phase(p,.15,.79));
    device(c,{x:800,y:520,angle:a,s:1.31,slider:-12});
    T(c,p<.47?'从师傅的视角看':'转到新人面前',95,131,72,coal,{weight:880});
    T(c,'同一个装置，视角在转',1439,734,32,coal,{align:'right'});
  },
  attribution(c,p){
    shop(c,true);
    device(c,{x:488,y:483,angle:.3,s:.92,slider:-15});
    const a=phase(p,.19,.66);
    rect(c,887,211,584,459,'#f1ecd8');
    for(let i=0;i<7;i++)bolt(c,917+i*87,236,8);
    T(c,'检修记录',931,309,49,coal,{weight:880});
    T(c,'观察：滑块卡住',931,418,43,coal);
    T(c,'猜测：他没有认真？',931,545,42,'#93614c');
    line(c,[[929,437],[929+472*a,437]],'#8d9e4d',6);
    T(c,'归因从这里开始',94,138,67,coal,{weight:860});
  },
  'hidden-key'(c,p){
    shop(c);
    const a=phase(p,.18,.75);
    const point=device(c,{x:767,y:542,angle:.54,s:1.38,slider:-15,wall:1-a});
    const [x,y]=point([-125,-124,19]);
    withAlpha(c,phase(p,.48,.8),()=>{ellipse(c,x,y,67,42,null,'#f5df77',5);arrow(c,1292,300,x+68,y-29,'#f5df77',5);});
    T(c,'知识诅咒',89,144,86,'#edf5cb',{weight:880});
    T(c,'我看得见的红标，\n他当时看得见吗？',1122,339,42,'#f7edbb',{max:393,leading:1.44});
  },
  listen(c,p){
    shop(c,true);
    device(c,{x:797,y:570,angle:.53,s:.85,slider:-24});
    const talk=(x,y,w,h,text,color)=>{
      round(c,x,y,w,h,19,color);
      poly(c,[[x+w*.35,y+h-1],[x+w*.52,y+h-1],[x+w*.41,y+h+34]],color);
      T(c,text,x+31,y+64,40,coal,{max:w-61,leading:1.34});
    };
    talk(88,126,566,166,'你当时看到什么？','#f7edc8');
    withAlpha(c,phase(p,.19,.47),()=>talk(903,182,584,172,'我看见两个槽。\n这个离手最近。','#d9e5ae'));
    withAlpha(c,phase(p,.44,.76),()=>T(c,'复述，再请对方确认',800,748,44,coal,{align:'center',weight:850}));
  },
  unlock(c,p){
    shop(c,true);
    const a=phase(p,.16,.75);
    const point=device(c,{x:825,y:543,angle:2.85,s:1.46,slider:mix(-194,-68,a),lane:-63,wall:.22});
    const [x,y]=point([-68,-63,104]);
    ellipse(c,x,y,67,41,null,'#749044',5);
    T(c,'黄点朝上，推到第一道刻线',88,145,65,coal,{weight:900});
    withAlpha(c,phase(p,.59,.86),()=>{
      line(c,[[1284,579],[1311,611],[1383,533]],'#58814e',13);
      T(c,'试一次，确认对上了',1449,701,34,coal,{align:'right'});
    });
  },
};
