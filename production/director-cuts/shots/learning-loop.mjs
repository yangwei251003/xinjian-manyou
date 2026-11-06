import { W,H,PI,mix,phase,saved,fill,rect,round,poly,line,ellipse,clip,gradient,grain,arrow,T,withAlpha } from '../drawing.mjs';

const desk = '#ceab78', ink='#402f26', green='#376b52', rust='#a95038', cream='#fff3d6';
function wood(c,night=0) {
  fill(c,gradient(c,0,0,1600,900,[[0,night?'#263c59':'#efcea0'],[1,night?'#192734':desk]]));
  for(let y=31;y<H;y+=73)line(c,[[0,y],[W,y+11]],night?'#293d51':'#b288585b',2);
  poly(c,[[0,0],[573,0],[1003,900],[530,900]],night?'#87a9c227':'#fff7d850');
  grain(c,712,.66);
}
function page(c,x,y,w,h,label,answer='',tone=cream) {
  round(c,x+14,y+19,w,h,9,'#62442d38');
  round(c,x,y,w,h,9,tone);
  for(let j=1;j<h/52;j++)line(c,[[x+28,y+45+j*43],[x+w-28,y+45+j*43]],'#9eab9960',1.5);
  line(c,[[x+74,y+19],[x+74,y+h-18]],'#d79485',2);
  for(let j=0;j<7;j++)ellipse(c,x+24,y+32+j*(h-62)/6,5,5,'#af9073');
  T(c,label,x+98,y+79,32,ink,{font:'StudioSerif',weight:850,max:w-116});
  T(c,answer,x+100,y+179,44,green,{font:'StudioSerif',leading:1.5,max:w-128});
}
function pencil(c,x,y,angle=-.6) {
  saved(c,()=>{
    c.translate(x,y);c.rotate(angle);
    rect(c,-92,-10,184,20,'#e1aa49');rect(c,-92,-1,184,6,'#bf7d33');
    round(c,-111,-10,26,20,3,'#bc6b59');poly(c,[[92,-10],[119,0],[92,10]],'#b58762');
    poly(c,[[110,-4],[119,0],[110,4]],ink);
  });
}
function clock(c,x,y,r,minutes,night=false) {
  ellipse(c,x+9,y+13,r,r,'#2a2a3739');ellipse(c,x,y,r,r,night?'#d5e0e1':'#f7e9c7',ink,4);
  for(let i=0;i<12;i++) {
    const a=i*PI/6-PI/2;
    line(c,[[x+(r-17)*Math.cos(a),y+(r-17)*Math.sin(a)],[x+(r-8)*Math.cos(a),y+(r-8)*Math.sin(a)]],ink,3);
  }
  line(c,[[x,y],[x-r*.37,y+r*.18]],ink,7);
  line(c,[[x,y],[x+r*.73*Math.sin(minutes*PI/30),y-r*.73*Math.cos(minutes*PI/30)]],rust,5);
  ellipse(c,x,y,5,5,ink);
}
export const shots = {
  fold(c,p) {
    wood(c);
    T(c,'把书合上以后',87,129,80,ink,{font:'StudioSerif',weight:850});
    T(c,'一个随手就能试的记忆实验',93,181,32,green);
    page(c,457,236,864,459,'先读这三个词','桂花　橘子　月亮');
    const a=phase(p,.46,.77);
    const edge=mix(1319,453,a);
    poly(c,[[1319,236],[edge,236+32*Math.sin(a*PI)],[edge,699+26*Math.sin(a*PI)],[1319,699]],'#648575','#3b5947',3);
    if(a>.89)T(c,'你还能想起哪三个？',891,491,57,'#fff6d9',{align:'center',font:'StudioSerif',weight:810});
    pencil(c,260,516,-1.1);clock(c,1398,231,74,8);
  },
  recall(c,p) {
    wood(c);
    page(c,96,125,805,585,'先在空白处写','桂花\n橘子\n______');
    pencil(c,mix(570,486,phase(p,.04,.43)),mix(430,478,phase(p,.04,.43)),-.85);
    const q=phase(p,.41,.76);
    saved(c,()=>{
      c.translate(1193+376*(1-q),414);c.rotate(.08);
      round(c,-220,-207,440,396,19,'#628a6d');
      T(c,'翻开核对',0,-108,36,'#fff6d7',{align:'center',font:'StudioSerif'});
      T(c,'月 亮',0,33,77,'#ffebbf',{align:'center',font:'StudioSerif',weight:820});
      line(c,[[-116,70],[112,70]],'#f3cf79',5);
    });
    withAlpha(c,q,()=>ellipse(c,314,439,145,43,null,rust,5));
  },
  comparison(c,p) {
    wood(c);
    rect(c,67,90,1453,659,'#fff1d4');
    T(c,'同一实验，即时与延迟测验',104,165,54,ink,{font:'StudioSerif'});
    T(c,'Roediger & Karpicke · 2006',1471,165,27,green,{align:'right'});
    const q=phase(p,.59,.77);
    const marker=mix(351,1187,q);
    line(c,[[236,434],[1371,434]],ink,5);
    for(const [x,stamp] of [[351,'5 分钟'],[798,'2 天'],[1187,'1 周']]){
      ellipse(c,x,434,14,14,ink);
      T(c,stamp,x,505,42,ink,{align:'center',font:'StudioSerif'});
    }
    arrow(c,marker,315,marker,407,green,7);
    T(c,p<.63125?'短时测验：重读表现更好':'延时测验：回忆练习保留更多',800,623,48,p<.63125?rust:green,{align:'center',font:'StudioSerif',weight:850});
    T(c,'结果方向示意 · 无虚构分数',1470,711,25,ink,{align:'right'});
  },
  habit(c,p) {
    wood(c);
    T(c,'给新动作找一个老位置',96,122,57,ink,{font:'StudioSerif'});
    round(c,154,275,481,420,93,'#58725b','#304b3e',5);
    round(c,246,215,280,100,41,null,'#304b3e',15);
    round(c,197,453,395,180,46,'#769681','#3d6050',5);
    line(c,[[244,486],[545,486]],'#e4c888',10);
    const a=phase(p,.13,.71);
    saved(c,()=>{c.translate(mix(1143,741,a),mix(292,548,a));c.rotate(mix(.17,-.07,a));page(c,0,0,384,243,'收包前','回忆两道题');});
    T(c,'收书包',400,755,40,ink,{align:'center'});
    T(c,'固定时机',1180,275,37,green,{align:'center'});
  },
  night(c,p) {
    wood(c,1);
    rect(c,967,80,535,467,'#3f5d79');
    ellipse(c,1297,230,82,82,'#eddaa4');ellipse(c,1331,205,80,80,'#3f5d79');
    for(const [x,y] of [[1061,161],[1127,251],[1414,351],[1383,146],[1019,395]])ellipse(c,x,y,4,4,'#f5e9c6');
    line(c,[[1240,80],[1240,547]],'#1b3143',14);line(c,[[967,328],[1502,328]],'#1b3143',14);
    page(c,112,261,731,441,'明早先做','不看答案再回忆','#dbe0cc');
    clock(c,849,190,89,mix(38,52,phase(p,.06,.89)),true);
    const a=phase(p,.24,.69);
    poly(c,[[0,0],[1030-460*a,0],[1270-500*a,900],[0,900]],`rgba(14,30,57,${.19+a*.31})`);
    T(c,'把夜晚留给睡眠',105,130,55,'#fdf5d3',{font:'StudioSerif',weight:830});
  },
  'next-day'(c,p) {
    wood(c);
    T(c,'第二天，把书留在一边',96,142,65,green,{font:'StudioSerif',weight:850});
    page(c,558,224,869,481,'昨天那三个词','桂花　橘子');
    saved(c,()=>{
      c.translate(164,328);c.rotate(-.14);round(c,0,0,299,360,8,'#507758');
      T(c,'先不翻书',149,185,40,'#fff6d9',{align:'center'});
    });
    withAlpha(c,phase(p,.14,.59),()=>{
      T(c,'月亮',1084,514,78,green,{font:'StudioSerif',weight:850});
      line(c,[[1078,532],[1284,532]],rust,5);
    });
    pencil(c,mix(1283,1433,phase(p,.32,.75)),529,-.63);
  },
};
