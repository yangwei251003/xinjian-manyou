import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,gradient,grain,clip,path,saved,T,withAlpha} from '../drawing.mjs';

const tomato='#c95543', ink='#64332f', ivory='#fae9c7', green='#527b65', lilac='#a298bd';
function pasteboard(c, color=tomato) {
  fill(c,color);
  poly(c,[[0,673],[484,543],[1097,639],[1600,499],[1600,900],[0,900]],'#e5ac79');
  grain(c,1380,.77);
}
function torn(c,x,y,w,h,tone) {
  const points=[[x,y+3],[x+w*.14,y],[x+w*.26,y+5],[x+w*.39,y-4],[x+w*.61,y+4],[x+w*.86,y-5],[x+w,y+3],
    [x+w-4,y+h],[x+w*.77,y+h-6],[x+w*.48,y+h+3],[x+w*.19,y+h-3],[x+5,y+h+4]];
  poly(c,points.map(([a,b])=>[a+9,b+13]),'#482a2738');poly(c,points,tone);
}
function arm(c,x,y,flip=1,tone=green){
  saved(c,()=>{
    c.translate(x,y);c.scale(flip,1);
    path(c,'M-400 19 L-180 -53 Q-102 -78 -45 -25 L14 -6 L68 -9 Q95 -5 78 19 L35 46 L91 27 Q118 31 92 57 L27 92 Q-51 103 -104 65 L-400 163 Z','#e7a784','#aa6356',3);
    poly(c,[[-400,16],[-168,-54],[-114,64],[-400,166]],tone);
  });
}
function poster(c,x,y,w,h){
  torn(c,x,y,w,h,ivory);
  const s=w/660;
  T(c,'社团海报',x+49*s,y+93*s,58*s,ink,{font:'StudioPlay',weight:400});
  rect(c,x+46*s,y+130*s,w-90*s,8*s,tomato);
  poly(c,[[x+117*s,y+226*s],[x+252*s,y+190*s],[x+326*s,y+273*s],[x+200*s,y+321*s]],lilac);
  ellipse(c,x+428*s,y+249*s,81*s,78*s,'#e7b36b');
  for(let i=0;i<3;i++)line(c,[[x+57*s,y+h-87*s+i*20*s],[x+w-66*s-i*28*s,y+h-87*s+i*20*s]],'#b79a82',3*s);
}
function scissors(c,x,y,angle,open) {
  saved(c,()=>{
    c.translate(x,y);c.rotate(angle);
    for(const sign of [-1,1]){
      c.save();c.rotate(sign*open);
      poly(c,[[-19,-13],[190,-15],[234,0],[196,16],[-19,21]],sign<0?'#e5e1ce':'#d1c3b9',ink,3);
      line(c,[[-15,0],[-61,-8]],ink,18);
      ellipse(c,-95,-11,43,31,null,ink,15);
      c.restore();
    }
    ellipse(c,0,0,13,13,'#986553',ink,3);
  });
}
function strip(c,x,y,w,h,rows) {
  let left=x;
  rows.forEach(([label,value,tone])=>{
    const width=w*value/120;
    rect(c,left,y,width-3,h,tone);
    T(c,label,left+width/2,y+h*.48,33,ink,{align:'center',max:width-17});
    T(c,`${value} 分钟`,left+width/2,y+h*.79,29,ink,{align:'center',max:width-17});
    left+=width;
  });
}
export const shots={
  request(c,p){
    pasteboard(c);
    const a=phase(p,.11,.63);
    poster(c,mix(1320,484,a),267,676,455);
    arm(c,mix(1522,1097,a),493,-1,lilac);
    arm(c,329,632,1,green);
    T(c,'把今天的时间摊开',93,145,83,ivory,{font:'StudioPlay',weight:400});
    T(c,'“今晚能全改完吗？”',1494,222,47,ivory,{align:'right',font:'StudioSerif'});
  },
  budget(c,p){
    pasteboard(c,'#d7a178');
    T(c,'今晚的两小时',94,147,84,ink,{font:'StudioPlay',weight:400});
    const a=phase(p,.04,.61);
    clip(c,91,281,1418*a,220,()=>strip(c,91,306,1418,170,[['作业',55,'#dfb16f'],['吃饭',25,'#cbb4ce'],['收拾',20,'#d48a75'],['空余',20,'#f7e8c3']]));
    const x=1393;
    withAlpha(c,phase(p,.47,.85),()=>{
      line(c,[[x,495],[x,572],[x-110,624]],ink,4);
      T(c,'这二十分钟可以拿来帮忙',1476,692,50,ink,{align:'right',font:'StudioSerif',weight:860});
    });
  },
  trim(c,p){
    pasteboard(c);
    const a=phase(p,.34,.69);
    torn(c,120,326,926,173,'#f4d3a2');
    torn(c,1049+130*a,326+61*a,371,173,'#fff0c7');
    line(c,[[1048,286],[1048,548]],ink,3,[11,11]);
    scissors(c,1048,615-175*phase(p,.16,.63),-1.57,.34*(1-a)+.07);
    T(c,'我能给出这一段',92,159,81,ivory,{font:'StudioPlay',weight:400});
    T(c,'已安排的时间',566,435,46,ink,{align:'center'});
    T(c,'检查开头',1237+130*a,426+61*a,44,ink,{align:'center',max:302});
    T(c,'20 分钟',1237+130*a,477+61*a,30,ink,{align:'center'});
  },
  adjust(c,p){
    pasteboard(c,'#e4a681');
    T(c,'还能怎样一起做？',86,143,78,ink,{font:'StudioPlay',weight:400});
    const designs=[['范围','先改开头','#f8e6bc'],['时间','明天再看','#cbb6d0'],['分工','你改图，我读字','#a6b8a0']];
    designs.forEach(([key,words,tone],i)=>{
      const a=phase(p,.04+i*.15,.38+i*.15);
      const x=98+i*498,y=273+i*36+140*(1-a);
      torn(c,x,y,405,324,tone);
      T(c,key,x+40,y+91,67,ink,{font:'StudioPlay',weight:400});
      line(c,[[x+43,y+125],[x+356,y+125]],ink,3);
      T(c,words,x+40,y+211,39,ink,{font:'StudioSerif',max:321});
    });
  },
  stop(c,p){
    fill(c,'#c2766b');
    poly(c,[[0,900],[762,455],[1600,549],[1600,900]],'#d9a180');
    rect(c,984,179,401,511,'#70433d');
    const a=phase(p,.13,.75);
    poly(c,[[984,179],[984+402*a,217],[984+402*a,686],[984,690]],'#71917e');
    ellipse(c,1037+300*a,475,13,13,'#e6ca98');
    T(c,'对话可以先停在这里',93,173,69,ivory,{font:'StudioPlay',weight:400});
    T(c,'离开现场，\n找可信任的人。',104,394,59,ivory,{font:'StudioSerif',leading:1.43,weight:820});
    grain(c,1386,.67);
  },
  agreed(c,p){
    pasteboard(c,'#bc7663');
    const a=phase(p,.08,.67);
    torn(c,mix(61,196,a),265,606,428,ivory);
    torn(c,mix(1046,819,a),265,590,428,'#b5c1a5');
    T(c,'我负责',484,375,63,ink,{align:'center',font:'StudioPlay',weight:400});
    T(c,'开头一起检查',485,507,43,ink,{align:'center',font:'StudioSerif'});
    T(c,'你负责',1109,375,63,ink,{align:'center',font:'StudioPlay',weight:400});
    T(c,'后面的图文修改',1112,507,43,ink,{align:'center',font:'StudioSerif'});
    T(c,'时间和分工都说清楚',800,146,69,ivory,{align:'center',font:'StudioSerif',weight:850});
    withAlpha(c,phase(p,.61,.83),()=>line(c,[[686,600],[721,636],[802,568],[882,632],[924,593]],green,8));
  },
};
