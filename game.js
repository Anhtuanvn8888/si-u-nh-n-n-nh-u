(()=>{'use strict';
const $=id=>document.getElementById(id);
const el={canvas:$('stage'),hud:$('hud'),score:$('score'),best:$('best'),speed:$('speed'),skill:$('skillTag'),tip:$('tip'),menu:$('menu'),pausePanel:$('pausePanel'),gameover:$('gameover'),leaderboard:$('leaderboard'),rankList:$('rankList'),avatarPreview:$('avatarPreview'),loseAvatar:$('loseAvatar'),nickname:$('nickname'),finalScore:$('finalScore'),finalBest:$('finalBest'),finalCoins:$('finalCoins'),currentGold:$('currentGold'),bankGold:$('bankGold'),homeVerdict:$('homeVerdict'),wifeMood:$('wifeMood'),wifeScene:$('wifeScene'),recordMsg:$('recordMsg'),wifeQuote:$('wifeQuote'),toast:$('toast')};
const canvas=el.canvas,ctx=canvas.getContext('2d',{alpha:false}),W=390;
const STORE='sieu-nhan-ne-nhau-v1';const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));const rand=(a,b)=>a+Math.random()*(b-a);const pick=a=>a[Math.floor(Math.random()*a.length)];
const safeStorage={get(k,def){try{const v=localStorage.getItem(STORE+'-'+k);return v==null?def:JSON.parse(v)}catch{return def}},set(k,v){try{localStorage.setItem(STORE+'-'+k,JSON.stringify(v))}catch{}}};
const saved=safeStorage.get('profile',{});let best=safeStorage.get('best',0);let ranking=safeStorage.get('ranking',[]);let bankGold=safeStorage.get('bankGold',0);
let audioOn=safeStorage.get('sound',true),audio=null,avatarImg=null,avatarData=saved.avatar||null,H=780,dpr=1,lastFrame=0,phase='menu',timer=0,worldScroll=0,spawnDistance=0,score=0,coins=0,passed=0,combo=0,lastSplitAt=-10,shake=0,flash=0,particles=[],obstacles=[],floatingTexts=[],shield=0,invulnUntil=0,slowUntil=0,doubleUntil=0,magnetUntil=0,damageUntil=0,player={x:99,y:380,vy:0,r:24,rot:0},totalRunTime=0,sceneLights=[],tutorialTime=0;
let toastTimer;
const ITEMS={ball:{label:'BÓNG ĐÁ',emoji:'⚽',color:'#56c5ff',duration:4,effect:'CHẬM 50% · 4 GIÂY'},racket:{label:'VỢT CẦU',emoji:'🏸',color:'#e9a0ff',duration:3,effect:'BẤT TỬ · 3 GIÂY'},dumbbell:{label:'TẠ GYM',emoji:'🏋️',color:'#ffd44d',duration:5,effect:'X2 ĐIỂM · 5 GIÂY'},water:{label:'NƯỚC THỂ THAO',emoji:'🥤',color:'#63ffb9',duration:0,effect:'KHIÊN ĐỠ 1 LẦN'},magnet:{label:'NAM CHÂM',emoji:'🧲',color:'#ff8580',duration:6,effect:'HÚT XU · 6 GIÂY'}};
const shops=[['BIA HƠI','Một cốc thôi!'],['LẨU NƯỚNG','Anh em đang chờ!'],['ỐC ĐÊM','Nhậu tí đi!'],['TẤT NIÊN','Trăm phần trăm!'],['BIA TƯƠI','Không say không về!'],['QUÁN NHẬU','Uống nốt ly này!']];
// V2 cartoon sprites are original local PNG assets, loaded only from this package.
const sprites={};
for(const name of ['hero','beer-stall','grill-stall','ball','racket','wife']){
  const im=new Image(); im.decoding='async'; im.src=`assets/${name}.png`; sprites[name]=im;
}
function spriteReady(name){return !!(sprites[name]?.complete&&sprites[name].naturalWidth>0)}
function paintSprite(name,x,y,w,h,opacity=1){
  if(!spriteReady(name))return false;
  ctx.save();ctx.globalAlpha=opacity;ctx.drawImage(sprites[name],x,y,w,h);ctx.restore();return true;
}
const wifeLines=['LẠI ĐI NHẬU À?!','BAY GIỎI THẾ SAO VẪN VỀ MUỘN?!','ANH CHỌN EM HAY CHỌN QUÁN BIA?!','HÔM NAY RỬA BÁT CẢ TUẦN!','ĐÃ BẢO LÀ ĐỪNG TẠT VÀO QUÁN!','SIÊU NHÂN MÀ CŨNG KHÔNG NÉ ĐƯỢC?!'];
function setPhase(p){phase=p;el.menu.classList.toggle('hidden',p!=='menu');el.gameover.classList.toggle('hidden',p!=='over');el.pausePanel.classList.toggle('hidden',p!=='pause');el.leaderboard.classList.toggle('hidden',p!=='leaderboard');el.hud.classList.toggle('hidden',p!=='play'&&p!=='pause');}
function resize(){let r=canvas.getBoundingClientRect();H=clamp(W*r.height/Math.max(1,r.width),590,930);dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
function rr(x,y,w,h,r=12){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}
function line(x1,y1,x2,y2,col='#fff',width=2){ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function text(t,x,y,size=18,color='#fff',align='center',stroke='#14204f',sw=3){ctx.font=`1000 ${size}px system-ui,-apple-system,Arial`;ctx.textAlign=align;ctx.textBaseline='middle';if(sw){ctx.lineJoin='round';ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.strokeText(t,x,y)}ctx.fillStyle=color;ctx.fillText(t,x,y)}
function emoji(t,x,y,size=25){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${size}px system-ui,Apple Color Emoji,Segoe UI Emoji`;ctx.fillText(t,x,y)}
function grad(x,y,w,h,c1,c2){let g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);rect(x,y,w,h,g)}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function outlined(x,y,r,fill,stroke='#1b2c4f',w=3){circle(x,y,r,fill);ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke()}
function sound(freq=380,secs=.09,type='sine',gain=.05){if(!audioOn)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.65),audio.currentTime+secs);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+secs);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+secs)}catch{}}
function showToast(msg){el.toast.textContent=msg;el.toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.add('hidden'),2100)}
function loadAvatar(uri){avatarData=uri;if(!uri){avatarImg=null;el.avatarPreview.textContent='😎';el.loseAvatar.textContent='😭';return}let im=new Image();im.onload=()=>{avatarImg=im;el.avatarPreview.replaceChildren();el.loseAvatar.replaceChildren();for(const d of [el.avatarPreview,el.loseAvatar]){let img=document.createElement('img');img.src=uri;img.alt='Khuôn mặt của bạn';d.appendChild(img)}};im.onerror=()=>showToast('Không đọc được ảnh, hãy chọn ảnh khác');im.src=uri}
function processFile(input){const file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){showToast('Hãy chọn file ảnh nhé');return}if(file.size>15*1024*1024){showToast('Ảnh quá lớn, chọn ảnh dưới 15MB');return}let u=URL.createObjectURL(file),im=new Image();im.onload=()=>{let b=document.createElement('canvas');b.width=b.height=180;const c=b.getContext('2d');let min=Math.min(im.naturalWidth,im.naturalHeight),sx=(im.naturalWidth-min)/2,sy=(im.naturalHeight-min)/2;c.drawImage(im,sx,sy,min,min,0,0,180,180);const uri=b.toDataURL('image/jpeg',.78);URL.revokeObjectURL(u);loadAvatar(uri);saveProfile();showToast('Đã gắn mặt vào siêu nhân!')};im.onerror=()=>{URL.revokeObjectURL(u);showToast('Ảnh không hợp lệ')};im.src=u;input.value=''}
function saveProfile(){safeStorage.set('profile',{avatar:avatarData,nick:el.nickname.value.trim().slice(0,16)||'Siêu nhân'})}
function drawAvatar(x,y,r,rotation=0,sad=false){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);outlined(0,0,r,'#ffdab1','#5d3a45',3.5);if(avatarImg?.complete&&avatarImg.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(0,0,r-2,0,Math.PI*2);ctx.clip();ctx.drawImage(avatarImg,-r,-r,r*2,r*2);ctx.restore()}else{ctx.fillStyle='#2a2436';ctx.beginPath();ctx.arc(0,-r*.31,r*.93,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#231d2c';ctx.beginPath();ctx.ellipse(-r*.34,-r*.1,3,4,0,0,Math.PI*2);ctx.ellipse(r*.3,-r*.1,3,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#993a46';ctx.lineWidth=2.3;ctx.beginPath();sad?ctx.arc(0,r*.55,r*.28,1.2,5.9):ctx.arc(0,r*.16,r*.35,0,Math.PI);ctx.stroke()}
ctx.fillStyle='#e9293b';ctx.fillRect(-r*.95,-r*.67,r*1.8,5);circle(r*.65,-r*.67,5,'#ffca22');ctx.restore()}
function drawHero(y,rot=0){
 const x=player.x;
 if(spriteReady('hero')){
   ctx.save();ctx.translate(x,y);ctx.rotate(rot*.48);
   if(invulnUntil>totalRunTime){ctx.shadowBlur=34;ctx.shadowColor='#ffe562'}
   const flap=Math.sin(timer*17)*3;
   // The sprite is centered on the player's original collision body. Cape deliberately trails left.
   paintSprite('hero',-90,-62+flap*.2,160,115);
   // Real player photo is clipped locally and never uploaded to a server.
   if(avatarImg?.complete&&avatarImg.naturalWidth){
      ctx.save();ctx.translate(10,-13+flap*.2);ctx.rotate(-.07);
      ctx.beginPath();ctx.ellipse(0,0,23,25,-.12,0,Math.PI*2);ctx.clip();
      const m=Math.min(avatarImg.naturalWidth,avatarImg.naturalHeight);
      const sx=(avatarImg.naturalWidth-m)/2,sy=(avatarImg.naturalHeight-m)/2;
      ctx.drawImage(avatarImg,sx,sy,m,m,-23,-25,46,50);
      ctx.restore();
      // Headband gives the attached photo the same heroic uniform.
      ctx.save();ctx.rotate(-.05);ctx.fillStyle='#d92c37';rr(-12,-38,46,8,4);ctx.fill();
      text('★',11,-34,10,'#ffdc49','center','#ba2835',1);ctx.restore();
   }
   if(invulnUntil>totalRunTime){
     ctx.shadowBlur=0;ctx.globalAlpha=.88;
     for(let i=0;i<4;i++)line(-116-i*17,-8+(i%2)*18,-66-i*7,-8+(i%2)*18,'#ffe779',3);
   }
   ctx.restore();return;
 }
 // Offline image-load fallback: always keep the game playable.
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 const wing=Math.sin(timer*17)*5;
 ctx.fillStyle='#e43c53';ctx.strokeStyle='#9e1736';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-8,-10);ctx.quadraticCurveTo(-52,-38-wing,-75,-23);ctx.quadraticCurveTo(-55,-5,-70,18);ctx.quadraticCurveTo(-42,13,-11,13);ctx.closePath();ctx.fill();ctx.stroke();
 line(-8,12,-38,22,'#252d61',12);line(12,10,-16,26,'#263468',12);
 outlined(-39,23,8,'#ffe46a','#3c3666',3);outlined(-17,26,8,'#ffe46a','#3c3666',3);
 rr(-30,-12,53,32,15);ctx.fillStyle='#1964d8';ctx.fill();ctx.strokeStyle='#0a3679';ctx.lineWidth=3;ctx.stroke();
 text('★',-3,1,18,'#ffe44c','center','#a72531',2.5);
 line(21,-6,39,-2,'#ffc6a6',9);outlined(40,-3,7,'#ffe1b6','#d48378',2);
 drawAvatar(5,-19,25,-.09);ctx.restore();
}
function background(time){const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b1c51');sky.addColorStop(.40,'#263f98');sky.addColorStop(.67,'#d873aa');sky.addColorStop(.87,'#ffaf74');sky.addColorStop(1,'#f7d59c');rect(0,0,W,H,sky);
// moon and sun glow
for(let k=5;k>=1;k--)circle(290,130,22+k*10,`rgba(255,208,146,${.02+(6-k)*.007})`);circle(290,130,20,'#ffe8b0');
// clouds
for(let i=0;i<7;i++){let x=((i*103-worldScroll*.14)%540+540)%540-80;let y=100+((i*67)%265);circle(x,y,19,'#ffffff16');circle(x+18,y-7,26,'#ffffff16');circle(x+45,y,23,'#ffffff16')}
// skyline
const hillY=H*.66;rect(0,hillY,W,H-hillY,'#284d77');for(let i=0;i<28;i++){let x=((i*33-worldScroll*.19)%950+950)%950-90,h=40+(i*59%85);rect(x,hillY-h,26,h,'#253c69');for(let w=0;w<2;w++)for(let k=0;k<4;k++)if((i+w+k)%3)rect(x+5+w*11,hillY-h+8+k*13,4,5,'#ffdd9288')}
// distant river
const waterY=H*.70;grad(0,waterY,W,H-waterY,'#376895','#1a3e6e');for(let i=0;i<16;i++){let x=((i*73-worldScroll*.23)%610+610)%610-30;line(x,waterY+7+i%4*18,x+24,waterY+7+i%4*18,'#f8c38666',2)}
// waterfront buildings, parallax
for(let i=0;i<14;i++){let x=((i*78-worldScroll*.34)%1180+1180)%1180-85,fy=H*.68,fh=50+(i*37%82);rect(x,fy-fh,67,fh,'#355075');grad(x+3,fy-fh+5,61,18,i%2?'#e5ab83':'#cbd3ac','#c27975');for(let a=0;a<2;a++)for(let b=0;b<3;b++)rect(x+12+a*28,fy-fh+30+b*24,12,15,'#ffda8c55')}
// bottom strip river road railing
rect(0,H-84,W,84,'#25395f');rect(0,H-84,W,11,'#bdc1a3');for(let x=(-worldScroll*.7)%76-76;x<W+76;x+=76){rect(x+16,H-93,9,54,'#bfbba1');rect(x+5,H-57,64,8,'#a1b9b7')}
// atmosphere stars
for(let i=0;i<15;i++){let x=(i*91)%W,y=(i*47)%260+60,alpha=.28+Math.sin(time*2+i)*.2;circle(x,y,i%3===0?1.8:1,`rgba(255,249,207,${alpha})`)}
}
function drawStall(x,y,w,h,title,upper=false,special=false){ctx.save();const bodyY=y+Math.min(34,h*.16);const shopColor=upper?'#bc2e43':'#9a2362';
ctx.shadowBlur=11;ctx.shadowColor='#f78d4088';rr(x+3,bodyY,w-6,h-(bodyY-y),9);ctx.fillStyle='#362947';ctx.fill();ctx.shadowBlur=0;
// shop outline
ctx.strokeStyle='#152e56';ctx.lineWidth=4;ctx.stroke();rect(x+9,bodyY+5,w-18,h-(bodyY-y)-12,'#653344');
// wood pillars
for(const px of [x+12,x+w-17]){rect(px,bodyY+2,7,h-(bodyY-y)-4,'#f4bb7c');rect(px+2,bodyY+7,3,h-(bodyY-y)-11,'#9f643e')}
// hanging lamps
for(let i=0;i<3;i++){const lx=x+26+i*(w-52)/2,ly=bodyY+27;line(lx,bodyY+5,lx,ly-5,'#f7cc89',2);circle(lx,ly,7,'#ffe78e');circle(lx,ly,3,'#fff7ca')}
// drinking friends 
const roomY=bodyY+h*.44;for(let i=0;i<2;i++){const hx=x+37+i*(w-74),hy=clamp(roomY,bodyY+43,y+h-40);circle(hx,hy,11,'#ffca9c');ctx.fillStyle='#26253c';ctx.beginPath();ctx.arc(hx,hy-6,12,Math.PI,Math.PI*2);ctx.fill();rr(hx-13,hy+10,26,25,8);ctx.fillStyle=i?'#58a8d9':'#e05c63';ctx.fill()}
const ty=clamp(y+h-31,bodyY+47,y+h-22);rect(x+20,ty,w-40,7,'#dc9c5d');emoji('🍺',x+w*.42,ty-14,18);emoji('🍺',x+w*.63,ty-15,18);
// awning & sign
const signH=Math.min(43,Math.max(30,h*.22));rr(x-2,y,w+4,signH,8);let g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,upper?'#d73439':'#dc3d5b');g.addColorStop(.5,'#a92347');g.addColorStop(1,'#e36d28');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#ffd77a';ctx.lineWidth=2;ctx.stroke();text(title,x+w/2,y+signH*.5,clamp(w/title.length*1.56,13,19),'#ffefc2','center','#70213c',3);
if(special){line(x-5,y+signH+2,x+w+5,y+signH+2,'#ffda4d',3)}
ctx.restore()}
function drawCartoonStall(x,y,w,h,title,kind='beer'){
 const sprite=kind==='grill'?'grill-stall':'beer-stall';
 if(!paintSprite(sprite,x-12,y-6,w+24,h+16)){
   drawStall(x,y,w,h,title,kind==='beer');return;
 }
 // All shop lettering is live text, instead of baked-in sample lettering.
 ctx.save();ctx.shadowColor='#ff4e23';ctx.shadowBlur=12;
 let signX=x+w*.51,signY=y+h*.29;
 const signW=w*.66;
 const titleSize=clamp((signW-10)/Math.max(4,title.length)*1.77,10,17);
 text(title,signX,signY,titleSize,'#ffefc3','center','#a91c31',3.3);
 ctx.restore();
}
function hazardColumn(x,y,w,h,variant='top'){
 if(h<4)return;
 ctx.save();
 const fill=ctx.createLinearGradient(x,y,x+w,y);
 fill.addColorStop(0,'rgba(92,24,67,.58)');fill.addColorStop(.48,'rgba(25,20,59,.34)');fill.addColorStop(1,'rgba(92,24,67,.58)');
 rr(x+8,y,w-16,h,8);ctx.fillStyle=fill;ctx.fill();
 ctx.strokeStyle='#ffb24c88';ctx.lineWidth=2;
 line(x+14,y+4,x+14,y+h-3,'#eeb2697a',3);
 line(x+w-14,y+4,x+w-14,y+h-3,'#eeb2697a',3);
 // Festive bulbs make the entire column visibly dangerous.
 for(let j=15;j<h-6;j+=36){
   const v=y+j;
   circle(x+14,v,4,'#ffca5a');circle(x+w-14,v,4,'#ffce65');
 }
 ctx.restore();
}
function drawObstacle(o){
 if(o.type==='split'){
   const y=o.midY,h=o.midH;
   ctx.save();ctx.shadowColor='#ff9950';ctx.shadowBlur=13;
   rr(o.x+4,y+8,o.w-8,h-16,12);ctx.fillStyle='#4b2a4d88';ctx.fill();ctx.restore();
   drawCartoonStall(o.x,y,o.w,h,o.shop[0],o.shop[0].includes('LẨU')?'grill':'beer');
   // Crucial game rule: exactly ONE item, randomly upper or lower; other lane stays empty.
   const itemY=o.lane==='top'?(90+y)/2:(y+h+H-105)/2;
   drawItem(o.item,o.x+o.w/2,itemY,Math.sin(timer*5)*4+1,o.got);
 }else{
   const t=o.top,b=o.bottom;
   hazardColumn(o.x,0,o.w,Math.max(0,t-125));
   drawCartoonStall(o.x,t-140,o.w,145,o.shop[0],o.shop[0].includes('LẨU')?'grill':'beer');
   drawCartoonStall(o.x,b,o.w,151,o.shop2[0],o.shop2[0].includes('LẨU')?'grill':'beer');
   hazardColumn(o.x,b+133,o.w,Math.max(0,H-(b+133)));
   if(o.coin&&!o.coin.got)drawCoin(o.coin.x,o.coin.y,o.coin.value);
 }
}
function drawCoin(x,y,value=10){let r=10+Math.sin(timer*7+x)*1;ctx.save();ctx.shadowBlur=17;ctx.shadowColor='#f8dc3d';outlined(x,y,r,'#ffd53b','#b86d19',3);text('★',x,y,13,'#fff8a0','center','#a66d15',1);ctx.restore()}
function drawItem(key,x,y,bob=0,got=false){
 if(got)return;
 const info=ITEMS[key];ctx.save();ctx.translate(x,y+bob);
 ctx.shadowColor=info.color;ctx.shadowBlur=24;
 outlined(0,0,26,'#08264ecc',info.color,3.8);ctx.shadowBlur=0;
 const asset=key==='ball'?'ball':key==='racket'?'racket':null;
 if(!asset||!paintSprite(asset,-26,-25,52,50))emoji(info.emoji,0,2,31);
 ctx.restore();
}
function drawFx(dt){for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;if(p.life<0){particles.splice(i,1);continue}ctx.globalAlpha=Math.min(1,p.life/.5);circle(p.x,p.y,p.size,p.color);ctx.globalAlpha=1}
for(let i=floatingTexts.length-1;i>=0;i--){let f=floatingTexts[i];f.life-=dt;f.y-=30*dt;if(f.life<=0){floatingTexts.splice(i,1);continue}ctx.globalAlpha=Math.min(1,f.life/.4);text(f.text,f.x,f.y,clamp(f.size,10,22),f.color);ctx.globalAlpha=1}}
function burst(x,y,color='#ffe560',count=13){for(let i=0;i<count;i++)particles.push({x,y,vx:rand(-110,110),vy:rand(-130,60),life:rand(.3,.8),size:rand(1.5,4.5),color})}
function flyText(t,x,y,col='#ffde46',size=16){floatingTexts.push({text:t,x,y,color:col,size,life:1.1})}
function drawSkillAura(){if(invulnUntil>totalRunTime){ctx.save();ctx.strokeStyle='#ffce48';ctx.lineWidth=4;ctx.shadowColor='#ffe55c';ctx.shadowBlur=16;ctx.beginPath();ctx.ellipse(player.x,player.y,54,32,-.12,0,2*Math.PI);ctx.stroke();ctx.restore();for(let i=0;i<4;i++)line(player.x-75-i*8,player.y+Math.sin(timer*5+i)*14,player.x-25-i*5,player.y+Math.sin(timer*5+i)*14,'#ffdb6299',2)}
else if(shield>0){ctx.save();ctx.strokeStyle='#62f4c4';ctx.shadowColor='#5affdf';ctx.shadowBlur=10;ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y,36+Math.sin(timer*9)*2,0,Math.PI*2);ctx.stroke();ctx.restore()}}
function drawForeground(){// dynamic pop-up heading
if(phase==='play'&&combo>=10&&passed%10<2){text('NÉ NHẬU SIÊU ĐỈNH! 🔥',W/2,158,16,'#ffe45c','#19334a',4)}
if(phase==='play'){let all=[];for(const [k,t] of [['ball',slowUntil],['racket',invulnUntil],['dumbbell',doubleUntil],['magnet',magnetUntil]])if(t>totalRunTime)all.push(`${ITEMS[k].emoji} ${(t-totalRunTime).toFixed(1)}s`);if(shield)all.push('🥤 KHIÊN');if(all.length){ctx.save();rr(84,H-118,220,34,12);ctx.fillStyle='#0e2741d8';ctx.fill();text(all.join('  '),W/2,H-101,13,'#ffed95');ctx.restore()}}
if(phase==='menu'){ctx.save();ctx.globalAlpha=.70;drawHero(H*.59+Math.sin(timer*3)*9,Math.sin(timer*2)*.06);ctx.restore()}}
function draw(){ctx.save();if(shake>0){ctx.translate(rand(-shake,shake),rand(-shake,shake))}background(timer);
for(const o of obstacles)drawObstacle(o);
if(phase==='play'||phase==='pause'){drawSkillAura();drawHero(player.y,player.rot);drawFx(0)}else if(phase==='menu'){drawForeground()}else if(phase==='over'){drawHero(H*.57,.52)}
if(phase==='play')drawForeground();if(flash>0){rect(0,0,W,H,`rgba(255,255,255,${flash*.35})`)}ctx.restore()}
function spawn(){const scoreIncr=score;const type=(passed>4&&passed-lastSplitAt>rand(5,9)&&Math.random()<.27)?'split':'normal',o={type,x:W+60,w:145,shop:pick(shops),shop2:pick(shops),counted:false};
if(type==='split'){
  o.w=174;o.midH=clamp(H*.205,125,165);o.midY=clamp(H*.48-o.midH/2,H*.35,H*.51);o.lane=Math.random()<.5?'top':'bottom';o.item=pick(Object.keys(ITEMS));o.got=false;lastSplitAt=passed;
}else{
  const playTop=H*.16,playBot=H-96;
  const gap=clamp(H*.33,214,262);o.top=rand(playTop+15,Math.max(playTop+16,playBot-gap-35));o.bottom=o.top+gap;
  const cx=o.x+o.w/2;o.coin=Math.random()<.66?{x:cx,y:(o.top+o.bottom)*.5,got:false,value:Math.floor(rand(8,16))}:null;
}obstacles.push(o)}
function hitRectCircle(cx,cy,r,x,y,w,h){const px=clamp(cx,x,x+w),py=clamp(cy,y,y+h);return (cx-px)**2+(cy-py)**2<r*r}
function collide(o){let x=o.x,rr=player.r*.74,y=player.y;if(o.type==='split')return hitRectCircle(player.x,y,rr,x,o.midY,o.w,o.midH);return hitRectCircle(player.x,y,rr,x,-150,o.w,o.top+150)||hitRectCircle(player.x,y,rr,x,o.bottom,o.w,H-o.bottom+60)}
function grant(k,x,y){const it=ITEMS[k];const at=totalRunTime;switch(k){case 'ball':slowUntil=Math.max(slowUntil,at)+4;break;case 'racket':invulnUntil=Math.max(invulnUntil,at)+3;player.vy=0;break;case 'dumbbell':doubleUntil=Math.max(doubleUntil,at)+5;break;case 'water':shield=1;break;case 'magnet':magnetUntil=Math.max(magnetUntil,at)+6;break;}burst(x,y,it.color,22);flyText(it.effect,Math.min(245,x),Math.max(160,y-48),it.color,13);sound(620,.25,'triangle',.09);el.tip.classList.add('hidden');updateHud()}
function updateHud(){el.currentGold.textContent=coins;el.bankGold.textContent=bankGold;el.score.textContent=score;el.best.textContent=Math.max(best,score);el.speed.textContent=(1+Math.min(totalRunTime/40,1.9)).toFixed(1)+'×';let label='';if(invulnUntil>totalRunTime)label='🏸 BẤT TỬ';else if(slowUntil>totalRunTime)label='⚽ CHẬM LẠI';else if(doubleUntil>totalRunTime)label='🏋️ X2 ĐIỂM';else if(shield)label='🥤 KHIÊN';else if(magnetUntil>totalRunTime)label='🧲 NAM CHÂM';el.skill.textContent=label;el.skill.classList.toggle('hidden',!label)}
function reset(){timer=0;totalRunTime=0;worldScroll=0;spawnDistance=90;score=0;coins=0;passed=0;combo=0;lastSplitAt=-10;shake=0;flash=0;particles=[];obstacles=[];floatingTexts=[];shield=0;invulnUntil=0;slowUntil=0;doubleUntil=0;magnetUntil=0;damageUntil=0;player={x:96,y:H*.48,vy:0,r:24,rot:0};tutorialTime=0;el.tip.classList.remove('hidden');setPhase('play');updateHud();el.best.textContent=best}
function start(){saveProfile();reset();sound(450,.14,'triangle',.07)}
function showHomeVerdict(){
 // Vang can mang ve la mot dong cho moi quan da ne. Xu thuong combo khong tinh la quan.
 const forgiven=passed>0&&coins>=passed;
 const shortage=Math.max(0,passed-coins);
 el.wifeScene.classList.remove('gift-forgiven','cash-forgiven','ear-pinched');
 el.homeVerdict.classList.toggle('forgiven',forgiven);
 el.homeVerdict.classList.toggle('pinched',!forgiven);
 el.wifeMood.classList.remove('hidden');
 if(forgiven){
   el.wifeScene.classList.add('cash-forgiven');el.wifeMood.textContent='😏';
   el.wifeQuote.textContent='DU VANG ROI! LAN NAY THA!';
   el.homeVerdict.textContent=`😏 Né ${passed} quán · ${coins} vàng: Vợ lườm rồi tha!`;
 }else{
   el.wifeScene.classList.add('ear-pinched');el.wifeMood.textContent='🤏👂';
   el.wifeQuote.textContent='THIEU VANG! VE DAY CHO VEO TAI!';
   el.homeVerdict.textContent=`😭 Né ${passed} quán · ${coins} vàng: ${shortage?`Thiếu ${shortage} vàng, `:''}bị véo tai!`;
 }
}
function gameOver(){if(phase!=='play')return;setPhase('over');shake=12;flash=1;burst(player.x,player.y,'#ffcc50',32);sound(170,.45,'sawtooth',.07);let record=score>best;if(record){best=score;safeStorage.set('best',best)}if(score>0){const name=(el.nickname.value.trim()||'Siêu nhân').slice(0,16);ranking=[...ranking,{nick:name,score,date:new Date().toLocaleDateString('vi-VN')}].sort((a,b)=>b.score-a.score).slice(0,10);safeStorage.set('ranking',ranking)}
el.finalScore.textContent=score;el.finalBest.textContent=best;el.finalCoins.textContent=coins;bankGold+=coins;safeStorage.set('bankGold',bankGold);el.recordMsg.textContent=(record?'🏆 KỶ LỤC MỚI! ':'')+`Vàng tích lũy: ${bankGold} 🪙`;showHomeVerdict();updateHud()}
function move(dt){timer+=dt;worldScroll+=(phase==='play'?1:.18)*dt*120;if(phase!=='play')return;totalRunTime+=dt;tutorialTime+=dt;if(tutorialTime>4)el.tip.classList.add('hidden');let speed=155*(1+Math.min(totalRunTime/44,1.9));if(slowUntil>totalRunTime)speed*=.5;let moveBy=speed*dt;worldScroll+=(speed-120)*dt;spawnDistance+=moveBy;let lastObj=obstacles[obstacles.length-1];if(!lastObj||spawnDistance>310){spawnDistance=0;spawn()}
const immortal=invulnUntil>totalRunTime;const floor=H-100,ceiling=104;
if(immortal){player.vy=0;player.y+=(H*.48-player.y)*Math.min(1,dt*5);player.rot=-.05}
else{player.vy=clamp(player.vy+790*dt,-370,420);player.y+=player.vy*dt;player.rot=clamp(player.vy/800,-.45,.48);if(player.y<ceiling+12||player.y>floor-12){gameOver();return}}
for(let i=obstacles.length-1;i>=0;i--){const o=obstacles[i];o.x-=moveBy;if(o.coin)o.coin.x-=moveBy;if(o.x+o.w < -45){obstacles.splice(i,1);continue}
if(!o.counted&&o.x+o.w<player.x-player.r*.6){o.counted=true;passed++;combo++;const earned=doubleUntil>totalRunTime?2:1;score+=earned;sound(420,.055,'sine',.02);if(combo>0&&combo%10===0){score+=5;flyText('COMBO +5 🔥',player.x+60,player.y-50,'#ffd744',16);burst(player.x,player.y,'#fff084',9)}updateHud()}
if(o.coin&&!o.coin.got){const c=o.coin;if((magnetUntil>totalRunTime&&Math.abs(c.x-player.x)<135)||Math.hypot(c.x-player.x,c.y-player.y)<26){c.got=true;coins+=c.value||10;flyText('+'+(c.value||10)+' VÀNG',c.x,c.y-26,'#ffe45a',13);burst(c.x,c.y,'#ffd24b',7);sound(880,.06,'triangle',.04);updateHud()}}
if(o.type==='split'&&!o.got){let iy=o.lane==='top'?(90+o.midY)/2:(o.midY+o.midH+H-105)/2;
 if(Math.hypot(player.x-(o.x+o.w/2),player.y-iy)<47){o.got=true;grant(o.item,player.x,iy)} }
if(!immortal && totalRunTime>damageUntil && collide(o)){
  if(shield){shield=0;damageUntil=totalRunTime+1.4;flash=.85;shake=7;burst(player.x,player.y,'#70ffe1',20);flyText('KHIÊN ĐÃ ĐỠ!',player.x+60,player.y-30,'#7bffe5',14);sound(230,.2,'square',.05);updateHud()}
  else{gameOver();return}}
}
shake=Math.max(0,shake-dt*35);flash=Math.max(0,flash-dt*2);for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;if(p.life<0)particles.splice(i,1)}for(let i=floatingTexts.length-1;i>=0;i--){const f=floatingTexts[i];f.life-=dt;f.y-=30*dt;if(f.life<0)floatingTexts.splice(i,1)} }
function flap(){if(phase==='play'){if(invulnUntil>totalRunTime)return;player.vy=-310;burst(player.x-30,player.y+15,'#fff0b7',4);sound(330,.07,'triangle',.022)}}
function loop(ts){let dt=Math.min(.034,(ts-lastFrame)/1000||.016);lastFrame=ts;move(dt);draw();requestAnimationFrame(loop)}
function togglePause(){if(phase==='play'){setPhase('pause');sound(290,.13)}else if(phase==='pause'){setPhase('play');lastFrame=performance.now()}}
function showRanking(){const prev=phase;setPhase('leaderboard');el.rankList.replaceChildren();let all=ranking.filter(r=>r&&typeof r.score==='number').slice(0,6);if(!all.length){let p=document.createElement('p');p.textContent='Chưa có điểm nào. Bay một ván để ghi tên!';el.rankList.appendChild(p)}all.forEach((r,i)=>{let div=document.createElement('div');div.className='rank-item';let left=document.createElement('span'),right=document.createElement('strong');left.textContent=`${i+1}. ${r.nick||'Siêu nhân'}`;right.textContent=`${r.score} điểm`;div.append(left,right);el.rankList.appendChild(div)});return prev}
function share(){const message=`🦸 SIÊU NHÂN NÉ NHẬU\nTao vừa né ${passed} quán, nhặt ${coins} vàng, được ${score} điểm, kỷ lục ${best}!\nMày có vượt được tao không?\n${location.protocol==='https:'?location.href:''}`;
if(navigator.share)navigator.share({title:'Siêu Nhân Né Nhậu',text:message}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(message).then(()=>showToast('Đã sao chép lời thách đấu!')).catch(()=>showToast('Chụp màn hình để khoe bạn bè nhé!'));else showToast('Chụp màn hình rồi gửi bạn bè nhé!')}
function bind(){el.nickname.value=saved.nick||'Chủ Tịch';loadAvatar(avatarData);
$('startBtn').addEventListener('click',start);$('replayBtn').addEventListener('click',start);$('homeBtn').addEventListener('click',()=>{setPhase('menu')});$('pauseHomeBtn').addEventListener('click',()=>setPhase('menu'));$('pauseBtn').addEventListener('click',togglePause);$('resumeBtn').addEventListener('click',togglePause);$('soundBtn').textContent=audioOn?'🔊 ÂM THANH':'🔇 TẮT TIẾNG';$('soundBtn').addEventListener('click',()=>{audioOn=!audioOn;safeStorage.set('sound',audioOn);$('soundBtn').textContent=audioOn?'🔊 ÂM THANH':'🔇 TẮT TIẾNG';sound(580)});$('leaderBtn').addEventListener('click',showRanking);$('closeLeaderBtn').addEventListener('click',()=>setPhase('menu'));$('shareBtn').addEventListener('click',share);
$('cameraBtn').addEventListener('click',()=>$('cameraInput').click());$('galleryBtn').addEventListener('click',()=>$('galleryInput').click());$('cameraInput').addEventListener('change',e=>processFile(e.target));$('galleryInput').addEventListener('change',e=>processFile(e.target));el.nickname.addEventListener('change',saveProfile);
canvas.addEventListener('pointerdown',e=>{if(phase==='play'){e.preventDefault();flap()}});
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){if(e.repeat)return;e.preventDefault();if(phase==='menu')start();else flap()}else if(e.code==='Escape'&&['play','pause'].includes(phase))togglePause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='play')setPhase('pause')});window.addEventListener('resize',resize);
resize();setPhase('menu');el.best.textContent=best;requestAnimationFrame(loop);
if(location.protocol==='https:'&&'serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
bind();
})();
