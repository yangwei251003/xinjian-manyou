import {W,H,PI,mix,phase,fill,rect,round,poly,line,ellipse,clip,gradient,grain,saved,T,withAlpha} from '../drawing.mjs';

const dark='#174a43', mint='#c5d9c2', white='#f8f4df', orange='#de885a';
function gallery(c){
  fill(c,gradient(c,0,0,W,H,[[0,'#edf0d6'],[1,'#8eb8a7']]));
  rect(c,0,681,W,219,'#83a99a');
  for(let i=0;i<10;i++)line(c,[[800+(i-4.5)*133,681],[800+(i-4.5)*310,900]],'#719487',2);
}
function student(c,x,y,s,pose=0,tone='#e8b882'){
  saved(c,()=>{
    c.translate(x,y);c.scale(s,s);
    ellipse(c,0,101,65,13,'#0a3e3331');
    line(c,[[-13,42],[-19,95]],'#374a45',15);line(c,[[13,42],[23,95]],'#374a45',15);
    round(c,-38,-54,76,110,22,tone);
    line(c,[[-30,-32],[-57,-7-pose*40]],tone,16);line(c,[[31,-32],[55,-2-pose*61]],tone,16);
    ellipse(c,55,-2-pose*61,10,10,'#e8af83');
    ellipse(c,0,-90,34,36,'#e4ae86');ellipse(c,-3,-114,36,20,'#3a3a33');
    ellipse(c,-10,-94,3,3,dark);ellipse(c,11,-93,3,3,dark);
    line(c,[[-8,-79],[1,-75],[9,-80]],dark,2.2);
  });
}
function photo(c,x,y,w,h,type,turn=0){
  saved(c,()=>{
    c.translate(x,y);c.rotate(turn);
    rect(c,-w/2+12,-h/2+16,w,h,'#234b3b39');
    rect(c,-w/2,-h/2,w,h,white);
    clip(c,-w/2+18,-h/2+18,w-36,h-58,()=>{
      rect(c,-w/2+18,-h/2+18,w-36,h-58,type==='win'?'#479b86':type==='practice'?'#b0c796':type==='friends'?'#81b5a1':'#b3ccc0');
      const scale=h/398;
      if(type==='win'){
        ellipse(c,23,-57,w*.26,h*.33,'#e0e7b94f');
        rect(c,-w*.29,h*.21,w*.23,h*.23,'#217765');rect(c,-w*.06,h*.09,w*.23,h*.38,'#2a8971');rect(c,w*.17,h*.27,w*.23,h*.18,'#217765');
        student(c,w*.048,-h*.17,1.08*scale,.85,orange);
        ellipse(c,w*.18,-h*.32,21*scale,21*scale,'#ffdf81');
      }else if(type==='practice'){
        round(c,-w*.36,h*.12,w*.72,h*.14,12,'#51775a');student(c,0,-h*.11,scale,.22,'#edb66d');
        for(let i=0;i<3;i++)rect(c,-w*.3+i*w*.2,h*.13,w*.14,h*.04,i%2?'#f3ddaa':'#dfad75');
      }else if(type==='friends'){
        ellipse(c,0,h*.17,w*.39,h*.14,'#c1a277');
        student(c,-w*.24,-h*.01,.85*scale,.63,'#ecd48e');student(c,w*.22,-h*.08,.93*scale,.23,'#428e81');
      }else{
        poly(c,[[-w*.36,h*.32],[-w*.36,-h*.33],[-w*.09,-h*.33],[-w*.09,h*.32]],'#7b9a8f');
        student(c,w*.16,0,.95*scale,.03,'#eac88b');
      }
    });
  });
}
export const shots={
  portrait(c,p){
    gallery(c);
    photo(c,996,433,mix(775,860,phase(p,.03,.8)),601,'win',-.055);
    T(c,'把镜头\n拉远一点',92,231,84,dark,{font:'StudioSerif',weight:850});
    T(c,'一张照片的边缘之外',97,463,32,dark);
    withAlpha(c,phase(p,.19,.42),()=>{
      line(c,[[651,213],[651,151],[718,151]],white,5);line(c,[[1300,151],[1363,151],[1363,215]],white,5);
      line(c,[[651,612],[651,669],[718,669]],white,5);line(c,[[1300,669],[1363,669],[1363,612]],white,5);
    });
  },
  pullback(c,p){
    gallery(c);
    const a=phase(p,.04,.63);
    photo(c,1061,291+61*a,675-230*a,465-153*a,'win',-.06);
    photo(c,512-140*(1-a),474,422,326,'practice',-.12);
    photo(c,1008+201*(1-a),596,449,314,'friends',.11);
    T(c,'被拍下的一秒',1065,132,36,dark,{align:'center'});
    T(c,'日常练习',295,697,33,dark,{align:'center'});
    T(c,'同伴协作',1271,751,34,dark,{align:'center'});
    T(c,'画框之外',99,146,68,dark,{font:'StudioSerif',weight:850});
  },
  situations(c,p){
    fill(c,'#8ab5a6');
    const shift=mix(103,70,phase(p,.25,.81));
    photo(c,450,412,687,489,'friends',-.042);
    photo(c,1192+shift,440,662,489,'quiet',.052);
    T(c,'熟悉的小组',445,712,45,dark,{align:'center',font:'StudioSerif'});
    T(c,'陌生的场合',1201,760,45,dark,{align:'center',font:'StudioSerif'});
    T(c,'同一个人，两个场合',800,113,64,white,{align:'center',font:'StudioSerif',weight:870});
  },
  spectrum(c,p){
    gallery(c);
    T(c,'人格倾向可以有中间位置',102,161,65,dark,{font:'StudioSerif',weight:840});
    rect(c,177,458,1244,28,gradient(c,177,0,1421,0,[[0,'#4b8f9b'],[.52,'#b3c982'],[1,'#d28b59']]));
    for(let i=0;i<10;i++)line(c,[[177+i*138,487],[177+i*138,503]],dark,2);
    for(const [i,x] of [420,649,795,886,1134].entries()){
      const a=phase(p,.09+i*.1,.33+i*.1);
      ellipse(c,x,mix(343,441,a),25,25,white,dark,4);
    }
    T(c,'更安静',177,567,43,dark);T(c,'更健谈',1420,567,43,dark,{align:'right'});
    T(c,'示意范围 · 观察多次、多种情境',800,674,30,dark,{align:'center'});
  },
  crop(c,p){
    gallery(c);
    const a=phase(p,.19,.71);
    photo(c,548,433,823,561,'practice',-.06);
    const x=mix(169,291,a),y=mix(237,272,a),w=mix(747,487,a),h=mix(351,293,a);
    line(c,[[x,y+65],[x,y],[x+65,y]],white,5);
    line(c,[[x+w-65,y],[x+w,y],[x+w,y+65]],white,5);
    line(c,[[x,y+h-65],[x,y+h],[x+65,y+h]],white,5);
    line(c,[[x+w-65,y+h],[x+w,y+h],[x+w,y+h-65]],white,5);
    T(c,'今天练什么？',1036,281,57,dark,{font:'StudioSerif'});
    T(c,'把开场\n讲清楚',1029,435,81,dark,{font:'StudioSerif',weight:880});
  },
};
