/* Siêu Nhân Né Nhậu — shop animations, connected leading hand, wife-scene rescue.
   Add BEFORE game-v3.js. No database migration; existing wallet, equipment and RPCs remain unchanged. */
(()=>{'use strict';
const CATALOG=[
['hero_classic','character','Siêu nhân đỏ','🦸'],['hero_thunder','character','Siêu nhân sấm sét','⚡'],['hero_sun','character','Siêu nhân kim cương','💎'],['hero_king','character','Siêu nhân đại gia','👑'],
['outfit_none','outfit','Đồ mặc định','🦸'],['outfit_vest','outfit','Vest Chủ Tịch','🤵'],['outfit_ninja','outfit','Ninja né nhậu','🥷'],['outfit_armor','outfit','Giáp chiến binh','🛡️'],['outfit_royal','outfit','Long bào đại gia','🥋'],
['hair_none','hair','Tóc mặc định','🙂'],['hair_red','hair','Tóc lửa','🔥'],['hair_blue','hair','Tóc xanh','💙'],['hair_rock','hair','Tóc rock','🎸'],
['glasses_none','glasses','Không kính','🙂'],['glasses_black','glasses','Kính đen','🕶️'],['glasses_heart','glasses','Kính trái tim','😍'],['glasses_star','glasses','Kính ngôi sao','🌟'],
['hat_none','hat','Đầu trần','🙂'],['hat_cap','hat','Mũ lưỡi trai','🧢'],['hat_cowboy','hat','Mũ cao bồi','🤠'],['hat_crown','hat','Vương miện','👑'],['hat_helmet','hat','Mũ chiến binh','🪖'],
['jewel_none','jewelry','Không trang sức','🙂'],['jewel_chain','jewelry','Dây chuyền vàng','📿'],['jewel_medal','jewelry','Huy chương','🥇'],['jewel_diamond','jewelry','Kim cương','💎'],
['pet_none','pet','Không có pet','➖'],['pet_dog','pet','Chó siêu nhân','🐶'],['pet_cat','pet','Mèo phi hành','🐱'],['pet_chicken','pet','Gà chiến bay','🐔'],['pet_duck','pet','Vịt phi công','🦆'],['pet_pig','pet','Lợn tên lửa','🐷'],['pet_dragon','pet','Rồng con','🐉']
].map(([id,slot,name,emoji])=>({id,slot,name,emoji}));
const BYNAME=new Map(CATALOG.map(o=>[o.name,o]));
const BASE={character:'hero_classic',outfit:'outfit_none',hair:'hair_none',glasses:'glasses_none',hat:'hat_none',jewelry:'jewel_none',pet:'pet_none'};
const INK='#253151',SKIN='#ffcca0',PET={pet_dog:'🐶',pet_cat:'🐱',pet_chicken:'🐔',pet_duck:'🦆',pet_pig:'🐷',pet_dragon:'🐉'};
const $=s=>document.querySelector(s);
function ell(c,x,y,rx,ry,color,edge='',weight=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=weight;c.stroke()}}
function rect(c,x,y,w,h,r,color,edge=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=3;c.stroke()}}
function limb(c,x,y,x2,y2,w,col){c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.lineWidth=w+4;c.strokeStyle=INK;c.stroke();c.lineWidth=w;c.strokeStyle=col;c.stroke()}
function emoji(c,ch,x,y,size){c.font=size+'px system-ui,Apple Color Emoji,Segoe UI Emoji';c.textAlign='center';c.textBaseline='middle';c.fillText(ch,x,y)}
function star(c,x,y,r,col){c.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,R=i%2?r*.45:r;let X=x+Math.cos(a)*R,Y=y+Math.sin(a)*R;i?c.lineTo(X,Y):c.moveTo(X,Y)}c.closePath();c.fillStyle=col;c.fill()}
function costume(e){let col='#286ddd',deep='#183d83',gold='#ffe06d';
if(e.character==='hero_thunder'){col='#8151dd';deep='#462d8f';gold='#e2cbff'}
if(e.character==='hero_sun'){col='#28a9be';deep='#186481';gold='#bcfaff'}
if(e.character==='hero_king'){col='#db9c2d';deep='#8b4a23';gold='#fff2a8'}
if(e.outfit==='outfit_vest'){col='#292f42';deep='#161a2d';gold='#fff8f1'}
if(e.outfit==='outfit_ninja'){col='#43385c';deep='#27213b';gold='#fc6575'}
if(e.outfit==='outfit_armor'){col='#799fc1';deep='#355574';gold='#e0f7ff'}
if(e.outfit==='outfit_royal'){col='#eeba39';deep='#8c3047';gold='#fff3a3'}
return {col,deep,gold}}
function hero(c,x,y,equip,sec,photo){const e={...BASE,...equip},f=Math.sin(sec*11),color=costume(e);c.save();c.translate(x,y+Math.sin(sec*4)*1.3);
if(e.character!=='hero_classic'){c.save();c.globalAlpha=.67;c.shadowBlur=15;c.shadowColor=color.gold;ell(c,-6,0,71+f*2,46,'#00000000',color.gold,3);c.restore()}
// Cape: always behind shoulders and arm.
c.beginPath();c.moveTo(-19,-16);c.quadraticCurveTo(-52,-43-f*7,-84,-24-f*4);c.quadraticCurveTo(-57,-3,-80,16+f*4);c.quadraticCurveTo(-54,16,-21,17);c.closePath();c.fillStyle='#e43e55';c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
c.beginPath();c.moveTo(-24,-9);c.quadraticCurveTo(-55,2,-70,11+f*4);c.lineTo(-22,9);c.fillStyle='#a51e43';c.fill();
// Far arm and bent legs.
limb(c,-15,2,-34,16,12,SKIN);ell(c,-36,18,8,8,SKIN,INK);
limb(c,-16,20,-41,34+f*3,13,color.deep);limb(c,2,21,-15,41-f*3,13,color.deep);
rect(c,-50,29+f*3,23,13,5,color.gold);rect(c,-26,36-f*3,23,13,5,color.gold);
// Outfit fits the body, unlike the old floating emoji-only preview.
rect(c,-24,-14,49,44,15,color.col);c.fillStyle=color.gold;c.fillRect(-19,16,38,6);rect(c,-6,15,13,10,2,'#fff2a8','#995c28');
if(e.outfit==='outfit_vest'){c.fillStyle='#fff';c.beginPath();c.moveTo(-12,-12);c.lineTo(2,10);c.lineTo(14,-12);c.fill();c.fillStyle='#ef556b';c.fillRect(0,-4,5,17)}
if(e.outfit==='outfit_ninja'){rect(c,-20,-8,40,18,6,color.deep);c.fillStyle='#ed5d6c';c.fillRect(-24,0,48,4)}
if(e.outfit==='outfit_armor'){for(let i=0;i<3;i++)rect(c,-12+i*9,-10,9,29,3,i%2?'#a7d0e9':'#c5dbec','#648aa3')}
if(e.outfit==='outfit_royal'){c.fillStyle='#bb2847';c.fillRect(-13,0,26,8);star(c,0,5,9,'#fff1a3')}
// Face positioned to agree with original selfie overlay (center 10,-13).
ell(c,11,-14,26,26,SKIN,INK,3);
if(photo&&photo.complete&&photo.naturalWidth){c.save();c.beginPath();c.ellipse(11,-14,23,24,0,0,Math.PI*2);c.clip();c.drawImage(photo,-12,-38,46,50);c.restore()}
else {ell(c,2,-18,3,4,'#212741');ell(c,22,-18,3,4,'#212741');c.beginPath();c.arc(12,-8,8,.05,Math.PI-.12);c.lineWidth=2.5;c.strokeStyle='#a54f56';c.stroke()}
if(e.hair!=='hair_none'&&e.hat==='hat_none'){let col=e.hair==='hair_red'?'#fb593e':e.hair==='hair_blue'?'#31c1f3':'#2a2b3e';c.beginPath();c.moveTo(-12,-25);c.lineTo(-5,-42);c.lineTo(1,-38);c.lineTo(8,-49);c.lineTo(15,-39);c.lineTo(23,-45);c.lineTo(36,-25);c.quadraticCurveTo(11,-38,-12,-25);c.fillStyle=col;c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke()}
else if(e.hat==='hat_none'){c.beginPath();c.arc(11,-19,25,Math.PI*1.06,Math.PI*1.97);c.strokeStyle='#3d2a37';c.lineWidth=6;c.stroke()}
if(e.glasses!=='glasses_none'){let col=e.glasses==='glasses_heart'?'#f24c80':e.glasses==='glasses_star'?'#f8c846':'#1b263c';for(const X of [0,21]){rect(c,X-9,-24,18,13,4,col,'#19192e');if(e.glasses==='glasses_star')star(c,X,-18,5,'#fff3b0')}limb(c,9,-18,12,-18,2,col)}
if(e.hat!=='hat_none'){if(e.hat==='hat_crown')emoji(c,'👑',11,-42,33);
else if(e.hat==='hat_cowboy'){ell(c,11,-39,35,6,'#9c6338',INK);rect(c,-9,-58,41,19,6,'#b67b45')}
else if(e.hat==='hat_helmet'){rect(c,-15,-49,54,24,12,'#64838d');limb(c,-11,-28,31,-28,4,'#ffdc63')}
else{rect(c,-14,-48,49,19,9,'#e84253');ell(c,34,-30,20,5,'#e84253',INK)}}
if(e.jewelry!=='jewel_none'){c.beginPath();c.arc(2,4,13,.15,Math.PI-.1);c.strokeStyle='#ffe372';c.lineWidth=4;c.stroke();if(e.jewelry==='jewel_diamond')emoji(c,'💎',3,16,12);else if(e.jewelry==='jewel_medal')emoji(c,'🥇',3,16,12)}
// FIX: leading arm goes forward (toward +x) and is drawn ON TOP of shoulder.
// Upper arm, elbow, forearm, fist have continuous coordinates throughout every frame.
const elbowX=37,elbowY=-9+f*3,handX=57+f*4,handY=-19+f*5;
limb(c,20,-1,elbowX,elbowY,12,color.col);limb(c,elbowX,elbowY,handX,handY,11,SKIN);ell(c,handX+2,handY-1,9,8,SKIN,INK,2);
c.restore()}
function pet(c,x,y,id,t){if(!PET[id])return;c.save();c.translate(x,y+Math.sin(t*5+id.length)*6);c.rotate(Math.sin(t*4)*.06);
c.beginPath();c.moveTo(-8,-6);c.quadraticCurveTo(-19,-20,-34,-16);c.lineTo(-24,7);c.lineTo(-6,10);c.closePath();c.fillStyle='#e64050';c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();
ell(c,-11,-5-Math.sin(t*17)*6,13,7,'#f8eafa','#6778a1');ell(c,5,7,18,13,'#fff0c7',INK);emoji(c,PET[id],5,-5,29);ell(c,21,-5,11,5,'#e9ecff','#7180ad');star(c,-32,16,3,'#ffeca2');c.restore()}
function itemArt(c,o,t){c.save();c.translate(0,Math.sin(t*5+o.id.length)*2.7);c.rotate(Math.sin(t*2.4+o.id.length)*.05);
const id=o.id;if(o.slot==='character'){c.scale(.48,.48);hero(c,0,7,{character:id},t,null)}
else if(o.slot==='pet'){c.scale(.88,.88);pet(c,0,5,id,t)}
else if(o.slot==='outfit'){let col=costume({character:'hero_classic',outfit:id}).col;c.scale(.8,.8);rect(c,-21,-20,42,44,8,col);limb(c,-21,-12,-33,5,10,col);limb(c,21,-12,33,5,10,col);rect(c,-9,-20,18,10,3,'#e8ebff')}
else if(o.slot==='hair'){const col=id==='hair_red'?'#f3472e':id==='hair_blue'?'#39c9ff':'#30334b';c.beginPath();c.moveTo(-29,14);c.lineTo(-28,-11);c.lineTo(-18,-7);c.lineTo(-10,-24);c.lineTo(0,-12);c.lineTo(10,-29);c.lineTo(19,-10);c.lineTo(29,-15);c.lineTo(28,13);c.quadraticCurveTo(0,-2,-29,14);c.closePath();c.fillStyle=col;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke()}
else if(o.slot==='glasses'){let col=id==='glasses_black'?'#1c233c':id==='glasses_heart'?'#ef497b':'#ffbc3d';rect(c,-33,-12,28,23,5,col);rect(c,5,-12,28,23,5,col);limb(c,-5,-2,5,-2,3,INK);if(id==='glasses_star'){star(c,-19,-1,9,'#fffab3');star(c,19,-1,9,'#fffab3')}}
else if(o.slot==='hat'){if(id==='hat_crown')emoji(c,'👑',0,0,45);else if(id==='hat_cowboy'){ell(c,0,15,35,7,'#a96e3e',INK);rect(c,-22,-19,44,34,12,'#bd8a51')}else if(id==='hat_helmet'){rect(c,-29,-23,58,39,14,'#6b8790');ell(c,0,17,31,6,'#e5c65a',INK)}else{rect(c,-26,-19,54,30,12,'#e44357');ell(c,28,11,22,7,'#e44357',INK)}}
else if(o.slot==='jewelry'){if(id==='jewel_chain'){c.beginPath();c.arc(0,-9,27,.1,Math.PI-.1);c.strokeStyle='#ffe07a';c.lineWidth=9;c.stroke();star(c,0,15,12,'#f7bc42')}else emoji(c,o.emoji,0,0,45)}
else emoji(c,o.emoji,0,0,40);c.restore()}
// Intercept ONLY the old static hero sprite, not user photos, stalls or other art.
const drawImage=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(source,...args){
if(this.canvas&&this.canvas.id==='game'&&source instanceof HTMLImageElement&&/\/assets\/hero\.png(?:[?#]|$)/.test(source.src)&&args.length===4){
try{let eq={...BASE};let g=JSON.parse(localStorage.getItem('nn3-guest')||'null');if(g&&g.equip)Object.assign(eq,g.equip);hero(this,0,0,eq,performance.now()/1000,null);return}catch(err){/* original sprite is the safe fallback */}}
return drawImage.call(this,source,...args)};
// Game paint() actually passes 4 coordinates after the image (five parameters total).
// Animation frame also updates the shop, using the exact same hero and pet model.
let shopCanvas=null,menuCanvas=null,cardCanvases=[],lastPaint=0;
const style=document.createElement('style');style.textContent=`
/* Shop cards remain fully interactive: only replace illustration nodes. */
.preview{height:177px!important;max-width:360px!important;background:radial-gradient(circle at 58% 47%,#466fc1,#172e5e 69%,#101735)!important;border:2px solid #ffd974!important;box-shadow:inset 0 0 22px #ffe58e22,0 6px 20px #0005}
.nn-shop-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.preview .preview-hero,.preview .preview-pet,.preview .preview-gear{opacity:0!important}
.product{position:relative;border:1px solid #9bb5e0!important;background:linear-gradient(145deg,#1b386d,#13264c)!important;box-shadow:0 4px 0 #080e27;transition:transform .18s,border-color .18s}
.product:hover,.product:focus-within{border-color:#ffe58e!important;transform:translateY(-2px)}
.productemoji{position:relative;min-height:60px;overflow:hidden;background:radial-gradient(circle,#365ea3,#112449)!important}
.nn-item-canvas{width:64px;height:60px;max-width:100%;display:block;pointer-events:none}
.productname{color:#fff4c9}.price{color:#ffe16b!important}
.nn-menu-canvas{max-width:90%;height:100%;object-fit:contain;filter:drop-shadow(0 5px 10px #fdcb6699)}
.wife{background:radial-gradient(circle at 50% 50%,#885d83,#312149)!important;min-height:175px;max-height:310px}
.wife>img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center center!important;filter:drop-shadow(0 4px 7px #0005)}
.wife-line{font-size:clamp(11px,3.2vw,16px)!important;padding:8px!important}
.nn-wife-fallback{display:flex;align-items:flex-end;justify-content:center;gap:22px;height:100%;padding:55px 10px 8px;font-size:clamp(57px,22vw,105px);background:linear-gradient(160deg,#613f62,#bd7e64)}
.nn-wife-fallback span:first-child{animation:nn-angry .65s ease-in-out infinite alternate}
.nn-wife-fallback span:last-child{animation:nn-scared 1.1s ease-in-out infinite alternate}
@keyframes nn-angry{to{transform:rotate(-12deg) translateY(-7px)}}
@keyframes nn-scared{to{transform:translateX(7px) rotate(5deg)}}
@media(max-height:650px){.wife{height:clamp(160px,29dvh,250px)!important}.over{gap:5px!important}}
@media(prefers-reduced-motion:reduce){.product,.nn-wife-fallback span{animation:none!important;transition:none!important}}
`;
document.head.append(style);
function previewGear(node){let e={...BASE},guest=null;try{guest=JSON.parse(localStorage.getItem('nn3-guest')||'null')}catch{}
if(guest&&guest.equip)Object.assign(e,guest.equip);
const heroEmoji=node.querySelector('.preview-hero')?.textContent;
const ch=CATALOG.find(o=>o.slot==='character'&&o.emoji===heroEmoji);if(ch)e.character=ch.id;
for(const el of node.querySelectorAll('.preview-gear,.preview-pet')){const v=el.textContent;const cand=CATALOG.find(o=>o.emoji===v&&o.id!==BASE[o.slot]&&o.slot!=='character');if(cand)e[cand.slot]=cand.id}
const label=$('.previewtag')?.textContent||'';
if(label.startsWith('✨ ĐANG THỬ: ')){const o=BYNAME.get(label.slice('✨ ĐANG THỬ: '.length).trim());if(o)e[o.slot]=o.id}
return e}
function setupPanel(){const content=$('#panelContent');if(!content||!$('#panel')||$('#panel').classList.contains('hidden')||!content.querySelector('.preview')){shopCanvas=null;cardCanvases=[];return}
const pv=content.querySelector('.preview');if(!pv.querySelector('canvas.nn-shop-canvas')){const cv=document.createElement('canvas');cv.width=720;cv.height=354;cv.className='nn-shop-canvas';cv.setAttribute('aria-label','Nhân vật mặc thử với hoạt ảnh tay và pet');pv.append(cv)}shopCanvas=pv.querySelector('canvas.nn-shop-canvas');
cardCanvases=[];for(const card of content.querySelectorAll('.product')){const name=card.querySelector('.productname')?.textContent;const o=BYNAME.get(name);const host=card.querySelector('.productemoji');if(!o||!host)continue;let cv=host.querySelector('canvas.nn-item-canvas');if(!cv){cv=document.createElement('canvas');cv.width=128;cv.height=120;cv.className='nn-item-canvas';cv.setAttribute('aria-label','Hoạt ảnh '+o.name);host.replaceChildren(cv)}cardCanvases.push({canvas:cv,item:o})}}
function setupMenu(){const holder=$('.heroimage'),img=holder?.querySelector('img');if(!holder||!img)return;img.style.display='none';if(!holder.querySelector('.nn-menu-canvas')){const cv=document.createElement('canvas');cv.width=350;cv.height=170;cv.className='nn-menu-canvas';cv.setAttribute('aria-label','Siêu nhân bay và vung tay');holder.insertBefore(cv,img)}menuCanvas=holder.querySelector('.nn-menu-canvas')}
function wifeFix(){const holder=$('.wife');const img=holder?.querySelector('img');if(!img)return;let attempt=0;const fall=()=>{attempt++;if(attempt===1){img.src='assets/wife.png';return}img.style.display='none';if(!holder.querySelector('.nn-wife-fallback')){const f=document.createElement('div');f.className='nn-wife-fallback';f.innerHTML='<span aria-label="Bà vợ nổi giận">👩‍🦰🧹</span><span aria-label="Siêu nhân lo sợ">🦸😰</span>';holder.insertBefore(f,holder.querySelector('.wife-face'))}};
img.addEventListener('error',fall);if(img.complete&&img.naturalWidth===0)fall()}
function paintTick(now){requestAnimationFrame(paintTick);if(now-lastPaint<33)return;lastPaint=now;const t=now/1000;
if(menuCanvas){const c=menuCanvas.getContext('2d');c.clearRect(0,0,350,170);c.save();c.translate(172,88);c.scale(1.17,1.17);hero(c,0,0,BASE,t,null);c.restore()}
if(!shopCanvas||$('#panel')?.classList.contains('hidden'))return;
const c=shopCanvas.getContext('2d'),e=previewGear(shopCanvas.parentNode);c.clearRect(0,0,720,354);c.save();c.translate(404,172);c.scale(2.15,2.15);star(c,-113,-47,7,'#ffe084');star(c,81,-67,4,'#fff5ba');hero(c,0,0,e,t,$('#face img'));pet(c,-75,36,e.pet,t);c.restore();
for(const {canvas,item:o} of cardCanvases){if(!canvas.isConnected)continue;const g=canvas.getContext('2d');g.clearRect(0,0,128,120);g.save();g.translate(64,58);g.scale(1.35,1.35);itemArt(g,o,t);g.restore()}}
function init(){setupMenu();wifeFix();setupPanel();const content=$('#panelContent');if(content){const obs=new MutationObserver(()=>setupPanel());obs.observe(content,{childList:true,subtree:true})}requestAnimationFrame(paintTick)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
