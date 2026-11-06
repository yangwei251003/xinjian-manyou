import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,gradient,grain,path,saved,T,withAlpha} from '../drawing.mjs';

const ink='#313650', sky='#dad6f1', grass='#7eab86', dark='#527a77', sand='#f4d7a4';
function ridge(c, points, color) {
  poly(c,points.map(([x,y])=>[x+11,y+15]),'#2a345535');
  poly(c,points,color);
}
function terrain(c, pan=0) {
  fill(c,gradient(c,0,0,0,H,[[0,sky],[1,'#f7dcbb']]));
  ellipse(c,1307-pan*.18,197,100,100,'#f7d48d');
  ridge(c,[[0,586],[227-pan*.19,248],[503,567],[829-pan*.21,262],[1072,536],[1329,323],[1600,501],[1600,900],[0,900]],'#a7a8cb');
  ridge(c,[[0,574],[207,441],[539-pan*.42,663],[866,508],[1115,676],[1397-pan*.32,525],[1600,623],[1600,900],[0,900]],'#9ebd9a');
  ridge(c,[[0,733],[273,631],[615,728],[991,612],[1243,709],[1600,649],[1600,900],[0,900]],grass);
  grain(c,518,.68);
}
function pine(c,x,y,s=1,color=dark) {
  saved(c,()=>{c.translate(x,y);c.scale(s,s);rect(c,-7,-62,14,65,'#786458');
    for(let i=0;i<3;i++)poly(c,[[-36-i*11,-43+i*15],[0,-132+i*36],[37+i*11,-43+i*15]],color);
  });
}
function cabin(c,x,y,s=1) {
  saved(c,()=>{c.translate(x,y);c.scale(s,s);
    ellipse(c,22,10,120,32,'#30465a37');
    rect(c,-90,-105,180,114,'#f4dcae');
    poly(c,[[-113,-100],[0,-181],[115,-100]],'#a85f55');
    rect(c,41,-155,26,43,'#c57c64');rect(c,-21,-65,43,74,'#6c626e');
    rect(c,-68,-80,34,31,'#edac55');rect(c,37,-80,34,31,'#edac55');
  });
}
function hiker(c,x,y,s=1,step=0,coat='#e8905c') {
  saved(c,()=>{c.translate(x,y);c.scale(s,s);
    ellipse(c,5,4,29,9,'#33494a4b');
    line(c,[[-9,-34],[-12-16*Math.sin(step),-2]],ink,10);
    line(c,[[10,-34],[16+16*Math.sin(step),-2]],ink,10);
    round(c,-28,-76,48,46,13,coat);
    round(c,-39,-69,24,35,8,'#64699c');
    ellipse(c,-4,-91,20,20,'#e8b486');
    poly(c,[[-31,-101],[-6,-118],[19,-101],[31,-93],[-30,-92]],'#ebd391');
    line(c,[[13,-62],[31,-43],[48,-4]],'#62545e',5);
  });
}
function trail(c,points,depth=0){line(c,points.map(([x,y])=>[x,y+depth]),'#5a747041',25);line(c,points,sand,19);}
const hills=[[38,747],[265,699],[517,732],[734,654],[934,681],[1164,582],[1494,628]];
export const shots={
  trailhead(c,p){
    terrain(c,115*p);trail(c,hills,9);
    cabin(c,256,692,1.15);
    for(const [x,y,s] of [[115,645,.7],[462,681,.73],[1317,607,.79],[1450,670,1.11]])pine(c,x,y,s);
    hiker(c,mix(389,965,phase(p,.1,.87)),mix(722,675,phase(p,.1,.87)),1.09,p*32);
    T(c,'独立也有补给站',79,163,83,ink,{font:'StudioSerif',weight:850});
    T(c,'一次沿着山径的思考',87,221,30,ink);
  },
  'secure-base'(c,p){
    terrain(c,0);
    ellipse(c,425,645,310,82,'#a3c7a1');cabin(c,300,661,1.16);
    hiker(c,430,658,1.26,.2,'#b7aa78');
    const progress=p<.47 ? phase(p,.06,.43) : p<.76 ? 1-.94*phase(p,.47,.72) : .06+.7*phase(p,.76,.98);
    const x=mix(494,1191,progress);
    const y=645-112*Math.sin(progress*PI*.83);
    trail(c,[[445,671],[648,645],[894,565],[1174,559]],8);
    hiker(c,x,y,.84,p*33);
    pine(c,1256,577,1.27);pine(c,1411,699,.78);
    T(c,'安全基地',91,148,69,ink,{font:'StudioSerif',weight:860});
    T(c,p<.47?'可以出发探索':p<.76?'也有地方可以回来':'安稳一些，再往前走',790,250,45,ink,{align:'center'});
    T(c,'照料者与儿童的探索示意',1474,741,27,ink,{align:'right'});
  },
  bridge(c,p){
    terrain(c,100);
    ridge(c,[[530,900],[616,603],[776,550],[920,558],[1160,900]],'#7999bd');
    const progress=phase(p,.12,.75);
    for(let i=0;i<12;i++){
      const a=phase(progress,i/14,i/14+.13);
      const x=527+i*49;
      poly(c,[[x,574-173*(1-a)],[x+46,573-173*(1-a)],[x+68,652-173*(1-a)],[x+14,655-173*(1-a)]],['#d2a66f','#e9c58e','#c89a6b'][i%3],'#a57a56',2);
    }
    hiker(c,mix(398,1160,phase(p,.52,.91)),629,.97,p*37);
    T(c,'有些路，多一块踏板就能走',86,146,66,ink,{font:'StudioSerif',weight:800});
    T(c,'陪伴',356,427,44,ink);T(c,'信息',751,395,44,ink);T(c,'实际帮忙',1100,437,44,ink);
  },
  ask(c,p){
    terrain(c,150);
    cabin(c,1144,667,1.47);pine(c,1397,716,1.28);
    hiker(c,mix(469,831,phase(p,.06,.57)),718,1.35,p*23);
    hiker(c,1013,682,1.49,0,'#a9a86a');
    const a=phase(p,.19,.62);
    withAlpha(c,a,()=>{
      path(c,'M255 236 Q255 190 309 190 L1134 190 Q1192 190 1192 241 L1192 405 Q1192 452 1136 452 L918 452 L837 528 L843 452 L307 452 Q255 452 255 405 Z','#fff1ce','#ac9981',3);
      T(c,'我卡在第二步了。\n你愿意陪我看一下吗？',313,297,49,ink,{font:'StudioSerif',leading:1.44});
    });
  },
  network(c,p){
    terrain(c,56);
    const places=[[320,609],[770,493],[1206,615]];
    const paths=[[[118,778],[349,678],[320,609]],[[349,678],[591,653],[770,493]],[[591,653],[925,681],[1206,615]]];
    paths.forEach((points,i)=>withAlpha(c,phase(p,i*.17,.39+i*.17),()=>trail(c,points,7)));
    places.forEach(([x,y],i)=>cabin(c,x,y,.69+i*.15));
    T(c,'一条路没通，还能找另一站',94,146,69,ink,{font:'StudioSerif',weight:850});
    ['可信任的人','家长或老师','合适的专业支持'].forEach((label,i)=>T(c,label,places[i][0],places[i][1]+59,32,ink,{align:'center'}));
  },
  lookout(c,p){
    terrain(c,140+100*p);
    ridge(c,[[0,900],[410,643],[849,663],[1283,534],[1600,625],[1600,900]],'#628d81');
    hiker(c,mix(875,1134,phase(p,.06,.65)),655,1.38,p*14);
    pine(c,1477,700,1.87,'#456b6c');
    T(c,'有人照应，\n你仍然自己迈步。',88,277,78,ink,{font:'StudioSerif',weight:850});
    grain(c,528,.57);
  },
};
