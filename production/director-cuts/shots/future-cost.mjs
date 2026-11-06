import {W,H,mix,phase,fill,rect,poly,line,ellipse,saved,T,withAlpha} from '../drawing.mjs';

const violet='#36274f', cream='#fff2b7', gold='#f4bf5c', blue='#76d6c5', coral='#ee8475';
const lo=new OffscreenCanvas(400,225);
const b=lo.getContext('2d');
function px(x,y,w,h,tone){b.fillStyle=tone;b.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function stars(t=0) {
  px(0,0,400,225,'#27213d');
  px(0,155,400,70,'#3a2f53');px(0,193,400,32,'#292239');
  for(let i=0;i<41;i++){
    const x=(i*97+31)%397, y=(i*i*23+33)%142;
    px(x,y,i%6===0?2:1,i%6===0?2:1,i%3===0?'#c5a6e2':'#6d6389');
  }
  for(let i=0;i<15;i++)px((i*31+t)%410,185+(i%4)*7,18,1,'#564465');
}
function coin(x,y,s=1){px(x-4*s,y-5*s,8*s,10*s,'#ad735b');px(x-3*s,y-6*s,6*s,12*s,gold);px(x-2*s,y-3*s,2*s,6*s,'#fff4a6');}
function player(x,y,t=0) {
  px(x-8,y-27,16,9,'#f1b380');px(x-7,y-30,14,4,'#2e2943');
  px(x+4,y-23,2,2,'#4d3b52');px(x-9,y-18,19,13,'#d97880');
  px(x-8,y-7,7,8+(t%2)*2,'#93cbc3');px(x+2,y-7,7,10-(t%2)*2,'#93cbc3');
}
function arcade(x=151,y=72,lit=true){
  px(x-6,y-8,111,129,'#170f29');px(x,y-4,99,123,'#645280');
  px(x-3,y-11,107,21,'#8065ab');px(x+9,y-7,83,8,'#c3a6db');
  px(x+9,y+17,81,49,'#211e31');px(x+13,y+22,73,40,lit?'#4c6876':'#37344a');
  if(lit){px(x+24,y+43,22,4,blue);px(x+62,y+35,12,4,gold);px(x+52,y+48,3,3,cream);}
  px(x-10,y+67,116,13,'#a785b8');px(x+17,y+69,14,5,coral);px(x+44,y+69,9,5,blue);
  px(x+62,y+88,17,6,'#211c32');px(x+31,y+97,33,22,'#30233f');
}
function present(c,draw){
  draw();
  saved(c,()=>{c.imageSmoothingEnabled=false;c.drawImage(lo,0,0,W,H);});
}
function heading(c,words,sub){
  T(c,words,77,122,78,cream,{font:'StudioPlay',weight:400});
  if(sub)T(c,sub,82,182,30,'#d6c9eb',{weight:720});
}
export const shots={
  insert(c,p){
    present(c,()=>{
      stars();arcade(175,70);player(134,187,0);
      for(let i=0;i<3;i++){
        const a=phase(p,.11+i*.15,.25+i*.15);
        if(a<.99)coin(mix(109+i*26,246,a),mix(119,162,a)-32*Math.sin(a*Math.PI),1.1);
      }
    });
    heading(c,'已经投进去的币','像素街机 / 选择继续之前');
    T(c,'3 枚代币',1217,424,58,gold,{align:'center',font:'StudioPlay',weight:400});
  },
  locked(c,p){
    present(c,()=>{
      px(0,0,400,225,'#322341');
      px(46,63,134,113,'#9b78a5');px(48,68,128,103,'#514162');
      px(63,110,98,49,'#232034');px(78,102,65,10,'#806288');
      for(let i=0;i<3;i++)coin(84+i*25,mix(105,139,phase(p,.18+i*.08,.57+i*.08)),1.55);
      px(196,51,9,136,'#ab7caa');px(209,51,3,136,'#685273');
      px(253,91,115,11,'#7fcbb4');px(254,153,115,11,'#d19291');
    });
    heading(c,'已经付出的一侧','代币锁在机器里');
    T(c,'沉没成本',444,757,49,cream,{align:'center',font:'StudioPlay',weight:400});
    T(c,'留下',1070,328,50,blue);T(c,'离开',1070,575,50,coral);
  },
  fork(c,p){
    present(c,()=>{
      stars();
      px(30,104,164,17,'#b88ab1');px(183,64,12,103,'#b88ab1');
      px(185,63,171,15,'#7dc6bb');px(185,153,171,15,'#c791ab');
      const a=phase(p,.19,.72);
      player(mix(57,171,a),102,Math.floor(a*18));
      px(337,49,22,16,blue);px(337,141,22,16,coral);
    });
    heading(c,'还剩二十分钟','下一步的时间可以重新分配');
    T(c,'继续玩下去',1100,220,48,blue,{align:'center',font:'StudioPlay',weight:400});
    T(c,'去做别的事',1100,588,48,coral,{align:'center',font:'StudioPlay',weight:400});
  },
  refund(c,p){
    present(c,()=>{
      stars();arcade(44,70,false);
      const a=phase(p,.16,.75);
      px(249,105,97,59,'#e6cb96');px(254,110,86,48,'#f7e4b5');
      for(let i=0;i<7;i++)px(321+i*2,114,1,35,'#67596d');
      coin(mix(294,365,a),mix(141,92,a),1.4);
    });
    heading(c,'能退的票，仍会影响选择');
    T(c,'三枚已投的币',380,771,35,'#e9c6d7',{align:'center'});
    T(c,'可退票',1128,528,51,violet,{align:'center',font:'StudioPlay',weight:400});
    T(c,'现在能拿回来',1140,749,39,cream,{align:'center'});
  },
  reset(c,p){
    present(c,()=>{
      stars();
      for(let i=0;i<22;i++)px(104+i*9,123,7,14,i<19?'#a6d5bc':'#594769');
      player(200,186,0);
      const a=phase(p,.2,.65);
      px(200-115*a,166,25,4,coral);px(175+115*a,166,25,4,blue);
    });
    heading(c,'从现在开始算');
    T(c,'20:00',800,461,157,cream,{align:'center',weight:900});
    T(c,'如果刚到这儿，你会选什么？',800,756,41,cream,{align:'center'});
  },
  credits(c,p){
    present(c,()=>{
      stars();arcade(18,64,false);
      px(0,187,400,12,'#80638b');
      player(mix(170,349,phase(p,.1,.81)),185,Math.floor(p*15));
      for(let i=0;i<6;i++)px(247+i*21,183,6,2,i%2?gold:blue);
    });
    heading(c,'决定的是下一步');
    T(c,'后面的乐趣、时间和代价',1053,420,52,cream,{align:'center',font:'StudioPlay',weight:400});
    T(c,'用它们来做选择',1053,491,35,'#d1d9e6',{align:'center'});
  },
};
