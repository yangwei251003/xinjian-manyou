import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,clip,gradient,lit,grain,saved,T,withAlpha} from '../drawing.mjs';

const wine='#2e183c', rose='#e4718a', cream='#ffe5b5', violet='#6b3a75';
function stage(c, light=1, x=800) {
  fill(c,gradient(c,0,0,0,900,[[0,'#1f1730'],[.62,'#443051'],[1,'#211a32']]));
  poly(c,[[x-61,0],[x+60,0],[x+404*light,703],[x-404*light,703]],gradient(c,0,0,0,705,[[0,'#ffdda0bc'],[1,'#ffdda019']]));
  rect(c,0,666,W,117,gradient(c,0,660,0,790,[[0,'#7e494a'],[1,'#352139']]));
  ellipse(c,x,688,360*light,67,'#f9b57555');
  for(let i=0;i<7;i++)line(c,[[0,679+i*19],[W,679+i*19]],'#e39f7e40',2);
}
function curtain(c,x,w,flip=1) {
  saved(c,()=>{
    c.translate(x,0);c.scale(flip,1);
    for(let i=0;i<10;i++){
      const a=i*w/10;
      poly(c,[[a,0],[a+w/10+2,0],[a+w/10+16,724],[a-9,754]],gradient(c,a,0,a+w/10,0,[[0,'#54203f'],[.45,'#8f365f'],[1,'#4b1c37']]));
    }
  });
}
function performer(c,x,y,s=1,gesture=0) {
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    ellipse(c,14,146,90,19,'#281a37b2');
    line(c,[[-21,74],[-30+gesture*26,138]],'#372843',28);
    line(c,[[21,74],[31-gesture*26,138]],'#372843',28);
    poly(c,[[-40,-46],[38,-46],[48,82],[-48,82]],'#f0ad86','#3e2947',4);
    line(c,[[-39,-31],[-70,-2-gesture*41]],'#f0ad86',23);
    line(c,[[39,-32],[65,5-gesture*67]],'#f0ad86',23);
    ellipse(c,65,6-gesture*67,13,13,'#f1c59e');
    ellipse(c,-70,-2-gesture*41,13,13,'#f1c59e');
    ellipse(c,0,-87,43,48,'#f5c8a1');
    ellipse(c,-3,-119,44,23,'#3b2946');
    ellipse(c,-17,-91,3.7,4.7,wine);ellipse(c,15,-91,3.7,4.7,wine);
    line(c,[[-11,-72],[0,-69+gesture*5],[13,-73]],wine,3);
  });
}
function pulse(c,x,y,width,p,color=rose) {
  const trace=[[0,0],[.24,0],[.29,-15],[.34,19],[.40,-64],[.45,42],[.49,-7],[.54,0],[1,0]];
  const max=width*phase(p,.02,.69);
  clip(c,x,y-75,max+2,124,()=>line(c,trace.map(([a,b])=>[x+a*width,y+b]),color,7));
}
function prop(c,x,y,w,h,tone,label) {
  poly(c,[[x,y],[x+w,y],[x+w+31,y-23],[x+31,y-23]],'#efc3a2');
  poly(c,[[x+w,y],[x+w+31,y-23],[x+w+31,y+h-23],[x+w,y+h]],'#53314c');
  rect(c,x,y,w,h,tone);
  T(c,label,x+w/2,y+h*.61,35,cream,{align:'center',max:w-23});
}
export const shots={
  curtain(c,p){
    stage(c,.9);performer(c,800,460,1.12,.14);
    const open=phase(p,.22,.76);
    curtain(c,-430*open,641);curtain(c,1600+430*open,641,-1);
    T(c,'心跳没有字幕',800,154,86,cream,{align:'center',font:'StudioSerif',weight:880});
    pulse(c,543,291,514,p);
    grain(c,807,.38);
  },
  'two-scenes'(c,p){
    clip(c,0,0,800,H,()=>{stage(c,.88,413);performer(c,417,479,1.12,.02);prop(c,524,479,142,155,'#6a446e','讲台');});
    clip(c,800,0,800,H,()=>{stage(c,.91,1189);performer(c,1187,479,1.12,.66);line(c,[[1377,492],[1377,669]],cream,8);ellipse(c,1377,485,17,23,rose);});
    line(c,[[800,122],[800,746]],'#f7cfaa',3);
    T(c,'等待报告',420,234,56,cream,{align:'center',font:'StudioSerif'});
    T(c,'期待演出',1188,234,56,cream,{align:'center',font:'StudioSerif'});
    pulse(c,144,324,537,p);pulse(c,917,324,537,p);
  },
  pressure(c,p){
    stage(c,.65,1007);performer(c,953,516,1.03,.07);
    const a=phase(p,.13,.62);
    for(const [i,label] of ['时间很紧','任务很难','支持很少'].entries()) {
      prop(c,106,520-i*133-35*(1-a),408,105,['#9d4c66','#a15768','#804365'][i],label);
    }
    T(c,'现场的压力',800,150,67,cream,{align:'center',font:'StudioSerif',weight:830});
    poly(c,[[1239,351],[1468,351],[1437,640],[1215,640]],'#543d62');
    T(c,'可用资源',1340,459,41,cream,{align:'center'});
    T(c,'也要看',1340,521,34,'#f7c48d',{align:'center'});
  },
  'new-reading'(c,p){
    fill(c,gradient(c,0,0,W,H,[[0,'#592c60'],[1,'#22213d']]));
    pulse(c,115,440,1370,p,rose);
    const a=phase(p,.3,.69);
    withAlpha(c,1-a,()=>T(c,'“我要失败了”',801,322-65*a,97,'#ffc3b9',{align:'center',font:'StudioSerif',weight:850}));
    withAlpha(c,a,()=>T(c,'“身体在准备上台”',801,366-44*a,91,cream,{align:'center',font:'StudioSerif',weight:850}));
    T(c,'同一段心跳',800,526,35,'#f2d6d0',{align:'center'});
    T(c,'认知重评',800,671,52,'#f2aa9b',{align:'center',font:'StudioSerif'});
  },
  'move-prop'(c,p){
    stage(c,mix(.55,1.05,phase(p,.24,.79)),750);
    performer(c,690,478,1.09,.34);
    const a=phase(p,.22,.67);
    prop(c,117+350*a,536,270,110,'#815e88','排练一次');
    prop(c,1094+272*a,441+62*a,298,191,'#995064','堆在一起的任务');
    T(c,'也可以改一改现场',800,148,69,cream,{align:'center',font:'StudioSerif'});
    pulse(c,560,287,468,p,'#f6c08e');
  },
  'stage-exit'(c,p){
    stage(c,.9,mix(850,1118,phase(p,.16,.78)));
    const a=phase(p,.09,.77);
    performer(c,mix(378,1091,a),494+Math.sin(a*6*PI)*11*(1-a),1.17,.37+.22*a);
    curtain(c,-170,390);curtain(c,1770,390,-1);
    T(c,'先说清处境',112,242,60,cream,{font:'StudioSerif'});
    T(c,'再迈下一步',118,330,73,'#f6bd8d',{font:'StudioSerif',weight:850});
  },
};
