import {W,H,PI,mix,phase,rng,fill,rect,round,poly,line,ellipse,clip,gradient,grain,arrow,saved,T,withAlpha} from '../drawing.mjs';

const clay='#a9593f', cream='#f5dfb4', ink='#4b3b33', leaf='#709377', sea='#5b9792';
const days=[[4,3],[8,5],[12,6],[14,7],[17,10],[21,12],[24,12]];
const second=[[5,2],[9,4],[10,5],[15,8],[18,8],[22,11],[25,13]];
function plaza(c){
  fill(c,gradient(c,0,0,W,H,[[0,'#f4dfb2'],[1,'#d4a181']]));
  grain(c,1217,.67);
}
function brick(c,x,y,w,d,h,tone,side='#8a5647') {
  poly(c,[[x,y],[x+w,y-45],[x+w+d,y-1],[x+d,y+44]],tone);
  poly(c,[[x,y],[x+d,y+44],[x+d,y+44+h],[x,y+h]],side);
  poly(c,[[x+d,y+44],[x+w+d,y-1],[x+w+d,y-1+h],[x+d,y+44+h]],'#b47762');
}
function tree(c,x,y,size=1,hot=false){
  saved(c,()=>{
    c.translate(x,y);c.scale(size,size);
    ellipse(c,hot?48:21,14,hot?102:77,31,'#4a6d6260');
    line(c,[[0,-2],[1,-109]],'#725844',19);
    ellipse(c,-17,-97,53,63,'#50715c');
    ellipse(c,18,-113,52,60,'#779c76');
    ellipse(c,-27,-123,43,42,'#8eaa75');
  });
}
function visitor(c,x,y,s,tone){
  ellipse(c,x+6,y+2,9*s,4*s,'#815e5055');
  line(c,[[x-2*s,y-10*s],[x-2*s,y]],'#625146',3*s);
  line(c,[[x+2*s,y-10*s],[x+3*s,y]],'#625146',3*s);
  round(c,x-7*s,y-29*s,14*s,21*s,5*s,tone);
  ellipse(c,x,y-36*s,6.8*s,7.8*s,'#d69e75');
}
function cart(c,x,y,s=1){
  saved(c,()=>{c.translate(x,y);c.scale(s,s);
    ellipse(c,13,3,91,19,'#66443845');
    brick(c,-69,-58,100,30,48,'#ffe8a9','#c37c55');
    ellipse(c,-34,0,13,13,'#584d43');ellipse(c,61,-12,13,13,'#584d43');
    line(c,[[-60,-58],[-60,-132]],'#795e51',6);
    line(c,[[62,-57],[62,-132]],'#795e51',6);
    poly(c,[[-92,-131],[55,-163],[97,-125],[-56,-94]],'#b85344');
    for(let i=0;i<4;i++)poly(c,[[-90+i*38,-130-i*8],[-72+i*38,-133-i*8],[-37+i*38,-98-i*8],[-55+i*38,-94-i*8]],'#ffda9d');
  });
}
function campus(c,{x=0,y=0,s=1,hot=false,alternative=false,p=0}={}){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    poly(c,[[102,449],[1131,223],[1519,473],[482,750]],'#9f6b534d');
    poly(c,[[99,416],[1131,196],[1518,433],[473,711]],alternative?'#a6b883':'#bfbd8d');
    poly(c,[[99,416],[473,711],[473,743],[99,452]],'#ad7e5e');
    poly(c,[[473,711],[1518,433],[1518,466],[473,743]],'#99745c');
    poly(c,[[374,357],[465,336],[1085,550],[985,578]],'#f6d5a4');
    brick(c,283,379,269,124,110,alternative?'#88b0a0':'#ca875f');
    for(let i=0;i<4;i++)poly(c,[[421+i*57,439-i*10],[445+i*57,435-i*10],[445+i*57,477-i*10],[421+i*57,480-i*10]],'#f1c98d');
    poly(c,[[750,365],[1122,285],[1328,405],[950,509]],'#a66c51','#ffedc7',3);
    line(c,[[937,324],[1133,459]],'#f6d5a2',3);
    ellipse(c,1031,390,62,28,null,'#f5d8a6',3);
    for(const [i,[xx,yy]] of [[1162,462],[1253,449],[1352,449],[1021,545],[797,625],[601,635]].entries())tree(c,xx,yy,1.05-i*.048,hot);
    cart(c,714,560,1.13);
    const random=rng(alternative?815:497);
    const n=hot?19:12;
    for(let i=0;i<n;i++){
      const near=i<7;
      const xx=(near?683:1022)+random()*(near?159:323)+Math.sin(p*2.4+i)*16;
      const yy=(near?572:473)+random()*(near?56:74);
      visitor(c,xx,yy,.9+random()*.31,['#9f4e44','#6d8b7c','#d3a76c','#616f7e'][i%4]);
    }
  });
}
function scatter(c, x,y,w,h,points,p,compact=false){
  rect(c,x,y,w,h,'#fff0d0');
  const left=x+(compact?69:106),right=x+w-43,bottom=y+h-74,top=y+50;
  line(c,[[left,top],[left,bottom],[right,bottom]],ink,3);
  for(let i=0;i<=5;i++){
    const xx=mix(left,right,i/5);
    line(c,[[xx,bottom],[xx,bottom+7]],ink,2);
    T(c,i*5,xx,bottom+33,compact?22:28,ink,{align:'center'});
  }
  for(let i=1;i<=4;i++){
    const yy=mix(bottom,top,i/4);
    line(c,[[left,yy],[right,yy]],'#b29b7860',1.5);
    T(c,i*4,left-15,yy+7,compact?22:27,ink,{align:'right'});
  }
  T(c,'树荫人数',left,top-16,compact?22:28,ink);
  T(c,'冰淇淋销量（份）',right,bottom+64,compact?22:27,ink,{align:'right'});
  points.forEach(([a,b],i)=>{
    const u=phase(p,i*.082,.24+i*.082);
    ellipse(c,mix(left,right,a/25),mix(bottom,top,b/16),u*(compact?9:15),u*(compact?9:15),i%2?sea:clay,'#fff5cf',2);
  });
}
export const shots={
  campus(c,p){
    plaza(c);campus(c,{p,s:1.04,x:-33,y:13});
    T(c,'一辆冰淇淋车的调查',77,128,73,ink,{font:'StudioSerif',weight:880});
    T(c,'从球场旁的一条观察开始',82,188,32,clay);
  },
  sample(c,p){
    plaza(c);campus(c,{x:-20,y:-48,s:1.06,p});
    const a=phase(p,.08,.54);
    rect(c,0,0,W,H,`rgba(50,49,42,${.28*a})`);
    saved(c,()=>{
      c.beginPath();c.ellipse(926,484,421-105*a,226-76*a,0,0,2*PI);c.clip();
      plaza(c);campus(c,{x:-20,y:-48,s:1.06,p});
    });
    ellipse(c,926,484,421-105*a,226-76*a,null,'#fff1b7',5);
    T(c,'午后 / 球场旁 / 连续几天',91,140,66,'#fff3d2',{font:'StudioSerif',weight:850});
    T(c,'样本有边界',107,706,47,'#fff3d2');
  },
  'day-log'(c,p){
    plaza(c);
    T(c,'把一天的两笔记录配在一起',89,138,65,ink,{font:'StudioSerif',weight:850});
    const i=Math.min(6,Math.floor(p*7));
    cart(c,440,518,2.39);
    tree(c,1148,490,1.91,false);
    for(let j=0;j<days[i][1];j++)visitor(c,969+(j%5)*76,551+Math.floor(j/5)*56,1.22,j%2?sea:clay);
    T(c,`${days[i][0]} 份`,454,684,82,clay,{align:'center',weight:900});
    T(c,`${days[i][1]} 人`,1147,729,76,ink,{align:'center',weight:900});
    T(c,`第 ${i+1} 天 · 示意数据`,1448,208,33,ink,{align:'right'});
  },
  scatter(c,p){
    plaza(c);scatter(c,106,164,1012,593,days,p);
    T(c,'正相关',1192,330,72,clay,{font:'StudioSerif',weight:880});
    T(c,'一个点\n代表一天',1192,439,46,ink,{font:'StudioSerif',leading:1.45});
    T(c,'自编七天数据',1474,719,27,ink,{align:'right'});
  },
  heat(c,p){
    plaza(c);campus(c,{p,hot:p>.41});
    const a=phase(p,.18,.68);
    ellipse(c,1328,190,76+14*a,76+14*a,'#f2b253');
    for(let i=0;i<8;i++){
      const angle=i*PI/4;
      line(c,[[1328+105*Math.cos(angle),190+105*Math.sin(angle)],[1328+(112+28*a)*Math.cos(angle),190+(112+28*a)*Math.sin(angle)]],clay,5);
    }
    T(c,'更热的天气？',85,138,76,ink,{font:'StudioSerif',weight:880});
    T(c,'有待检验的共同原因',90,201,37,clay);
    line(c,[[1224,245],[733,389],[715,459]],clay,4,[12,11]);
    line(c,[[1321,294],[1257,363],[1232,421]],clay,4,[12,11]);
  },
  replicate(c,p){
    plaza(c);
    T(c,'换个地方，再按同样方法记录',89,127,63,ink,{font:'StudioSerif',weight:850});
    scatter(c,87,224,686,459,days,.95,true);
    scatter(c,826,224,686,459,second,phase(p,.18,.87),true);
    T(c,'球场旁 / 第一次',432,196,30,ink,{align:'center'});
    T(c,'另一个校园 / 复测示意',1167,196,30,ink,{align:'center'});
    T(c,'记录方法相同，地点与条件可能不同',800,752,34,ink,{align:'center'});
  },
  'field-notes'(c,p){
    plaza(c);campus(c,{p,s:.57,x:726,y:245,alternative:true});
    const a=phase(p,.04,.56);
    saved(c,()=>{
      c.translate(92,155+67*(1-a));c.rotate(-.045);
      rect(c,9,13,735,559,'#72584944');rect(c,0,0,735,559,'#fff0cd');
      T(c,'调查笔记',53,99,67,ink,{font:'StudioSerif',weight:870});
      ['圈出样本的边界','找一个替代解释','让别人照方法再试'].forEach((label,i)=>{
        const y=207+i*120;
        line(c,[[58,y+20],[678,y+20]],'#a68772',1.5);
        T(c,`${i+1}. ${label}`,56,y,41,clay,{font:'StudioSerif',max:622});
      });
    });
  },
};
