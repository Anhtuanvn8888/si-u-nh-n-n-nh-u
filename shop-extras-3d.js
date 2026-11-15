/* SIÊU NHÂN NÉ NHẬU — V7: phụ kiện và pet gắn trên cùng hệ tọa độ của sprite 3D.
 * V7 không chèn lớp preview riêng gây lệch; hook trực tiếp renderSprite của V5.
 * Giữ nguyên logic mua hàng, vàng, Supabase và mã item cũ.
 */
(()=>{'use strict';
 if(window.NNExtras3D)return;
 const VERSION='8.0.0',SOURCE_W=591.333,SOURCE_H=443.5,COLS=5,TW=256,TH=184;
 const sheet=new Image();sheet.decoding='async';sheet.src='shop-extras-3d.webp?v=8.0.0';
 const wear=new Image();wear.decoding='async';wear.src='shop-wearables-v7.webp?v=8.0.0';
 const $=s=>document.querySelector(s);
 // Vùng đích là tọa độ PIXEL trên ảnh 3D nguồn 591×443. Cả kính và mũ
 // dùng chung phép tịnh tiến, tỷ lệ, dao động và góc xoay của nhân vật.
 const list=[
  ['hair_red','Tóc lửa','hair',[270,6,222,145],[0,20,256,126]],
  ['hair_blue','Tóc xanh','hair',[270,6,222,145],[0,18,256,132]],
  ['hair_rock','Tóc rock','hair',[270,6,222,145],[0,22,256,130]],
  ['glasses_black','Kính đen','glasses',[367,125,143,60],[0,85,444,253],4],
  ['glasses_heart','Kính trái tim','glasses',[374,126,135,57],[0,90,443,253],5],
  ['glasses_star','Kính ngôi sao','glasses',[374,126,142,58],[0,85,443,258],6],
  ['hat_cap','Mũ lưỡi trai','hat',[312,47,226,119],[3,85,438,327],0],
  ['hat_cowboy','Mũ cao bồi','hat',[305,38,220,115],[0,60,443,335],1],
  ['hat_crown','Vương miện','hat',[350,-15,159,140],[0,0,443,443],2],
  ['hat_helmet','Mũ chiến binh','hat',[322,0,204,162],[0,25,443,418],3],
  ['jewel_chain','Dây chuyền vàng','jewelry',[339,247,105,75],[5,40,246,122]],
  ['jewel_medal','Huy chương','jewelry',[328,233,119,133],[16,3,228,178]],
  ['jewel_diamond','Kim cương','jewelry',[324,238,142,105],[0,22,250,124]],
  ['pet_dog','Chó siêu nhân','pet',[8,318,169,135],[8,17,240,167]],
  ['pet_cat','Mèo phi hành','pet',[8,318,169,135],[7,17,243,166]],
  ['pet_chicken','Gà chiến bay','pet',[8,318,169,135],[15,15,229,166]],
  ['pet_duck','Vịt phi công','pet',[8,318,169,135],[20,17,231,166]],
  ['pet_pig','Lợn tên lửa','pet',[8,318,169,135],[14,15,241,166]],
  ['pet_dragon','Rồng con','pet',[8,318,169,135],[20,15,229,166]]
 ].map(([id,name,slot,box,crop,wearIndex],i)=>({id,name,slot,box,crop,i,wearIndex}));
 const byId=new Map(list.map(x=>[x.id,x])),byName=new Map(list.map(x=>[x.name,x]));
 const DEFAULT={hair:'hair_none',glasses:'glasses_none',hat:'hat_none',jewelry:'jewel_none',pet:'pet_none'};
 const petEmojis=new Set(['🐶','🐱','🐔','🦆','🐷','🐉']);
 let online=false,onlineEq={},authTicket=0,pending=null;
 const baseDraw=CanvasRenderingContext2D.prototype.drawImage;
 const baseFill=CanvasRenderingContext2D.prototype.fillText;
 const baseTranslate=CanvasRenderingContext2D.prototype.translate;
 let justRenderedGameHero=0;
 function guestEq(){try{return {...DEFAULT,...(JSON.parse(localStorage.getItem('nn3-guest')||'{}').equip||{})}}catch{return {...DEFAULT}}}
 function worn(){return online?{...DEFAULT,...onlineEq}:guestEq()}
 function previewEquip(){
  const e=worn(),tag=$('#panelContent .previewtag')?.textContent||'';
  const m=tag.match(/^✨ ĐANG THỬ:\s*(.+)$/);
  if(m){const p=byName.get(m[1].trim());if(p)e[p.slot]=p.id}
  return e;
 }
 function ready(){return sheet.complete&&sheet.naturalWidth>=TW*COLS}
 function drawAsset(c,p,t){
  if(!p)return;
  const useWear=p.wearIndex!==undefined;
  const target=useWear?wear:sheet;
  if(!target.complete||!target.naturalWidth)return;
  const [x,y,w,h]=p.box,[rx,ry,rw,rh]=p.crop;
  const cx=useWear?(p.wearIndex%4)*(target.naturalWidth/4): (p.i%COLS)*TW;
  const cy=useWear?Math.floor(p.wearIndex/4)*(target.naturalHeight/2):Math.floor(p.i/COLS)*TH;
  c.save();
  if(p.slot==='pet'){
   const bob=Math.sin(t*5.2+p.i)*7;
   c.translate(x+w/2,y+h/2+bob);c.rotate(Math.sin(t*3.5+p.i)*.04);
   baseDraw.call(c,target,cx+rx,cy+ry,rw,rh,-w/2,-h/2,w,h);
  }else baseDraw.call(c,target,cx+rx,cy+ry,rw,rh,x,y,w,h);
  c.restore();
 }
 function withSourceCoordinates(c,w,h,callback){
  c.save();c.scale(w/SOURCE_W,h/SOURCE_H);c.translate(-SOURCE_W/2,-SOURCE_H/2);
  callback();c.restore();
 }
 function drawBehind(c,w,h,t,eq){
  const e=eq||worn();if(!ready())return;
  withSourceCoordinates(c,w,h,()=>drawAsset(c,byId.get(e.pet),t));
  if(c.canvas?.id==='game')justRenderedGameHero=performance.now();
 }
 function drawAbove(c,w,h,t,eq){
  const e=eq||worn();if(!ready())return;
  withSourceCoordinates(c,w,h,()=>{
   // Tóc nằm dưới mũ, kính nằm dưới vành mũ nhưng trên mặt.
   if(e.hat==='hat_none')drawAsset(c,byId.get(e.hair),t);
   drawAsset(c,byId.get(e.hat),t);
   drawAsset(c,byId.get(e.glasses),t);
   drawAsset(c,byId.get(e.jewelry),t);
  });
 }
 // Ngăn PET vector đời cũ vẽ đè lên pet 3D đã đặt SAU siêu nhân.
 // Chỉ chặn đúng emoji và dải cape trong đoạn drawPet; mọi HUD/score vẫn dùng native.
 CanvasRenderingContext2D.prototype.fillText=function(txt,x,y,...args){
  if(this?.canvas?.id==='game'&&petEmojis.has(txt)&&x===0&&y===0&&ready())return;
  return baseFill.call(this,txt,x,y,...args);
 };
 CanvasRenderingContext2D.prototype.translate=function(x,y,...args){
  if(this?.canvas?.id==='game'&&ready()&&justRenderedGameHero&&performance.now()-justRenderedGameHero<18&&x>=6&&x<=36&&y>90){
   // Legacy drawPet() uses hero.x-77±9 (=12..30) to draw the red 2D cape.
   // This ctx.save() scope ends after drawPet(), so no other draws are hidden.
   this.globalAlpha=0;
   justRenderedGameHero=0;
  }
  return baseTranslate.call(this,x,y,...args);
 };
 function observeMode(){
  const state=$('#state');if(!state)return;
  const update=()=>{
   const next=(state.textContent||'').includes('ONLINE');if(next===online)return;
   online=next;onlineEq={};authTicket++;
   if(online)loadOnline();
  };
  update();new MutationObserver(update).observe(state,{childList:true,characterData:true,subtree:true});
 }
 async function loadOnline(){
  const ticket=++authTicket,cfg=window.NN_CLOUD||{};
  if(!window.supabase||!cfg.url||!cfg.anonKey)return;
  try{
   const client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{detectSessionInUrl:false}});
   const {data}=await client.auth.getSession();const id=data?.session?.user?.id;
   if(!id||ticket!==authTicket)return;
   const {data:p,error}=await client.from('players').select('equipped').eq('id',id).single();
   if(!error&&ticket===authTicket)onlineEq={...DEFAULT,...(p?.equipped||{})};
  }catch{}
 }
 // Khi bấm MUA, chờ dữ liệu sở hữu cập nhật rồi tự ấn MẶC đúng item.
 // Không đổi logic giá hay giao dịch RPC bên trong game gốc.
 function syncUi(){
  const root=$('#panelContent'),tag=root?.querySelector('.previewtag')?.textContent||'';
  if(online&&tag.startsWith('✨ ĐANG MẶC:')){
   const s=tag.slice('✨ ĐANG MẶC:'.length),next={...onlineEq};
   for(const slot of ['hair','glasses','hat','jewelry','pet'])next[slot]=DEFAULT[slot];
   for(const p of list)if(s.includes(p.name))next[p.slot]=p.id;
   onlineEq=next;
  }
  if(!pending)return;
  if(performance.now()-pending.at>15000){pending=null;return}
  const card=[...(root?.querySelectorAll('.product')||[])].find(c=>c.querySelector('.productname')?.textContent.trim()===pending.name);
  const b=card?.querySelector('.productactions button:last-child');
  if(!b)return;
  const label=b.textContent.trim();
  if(label.includes('ĐANG DÙNG')){pending=null;return}
  if(label==='MẶC'){
   pending=null;
   queueMicrotask(()=>{if(b.isConnected&&!b.disabled&&b.textContent.trim()==='MẶC')b.click()});
  }
 }
 function init(){
  observeMode();const root=$('#panelContent');if(root){
   let schedule=false;const refresh=()=>{if(schedule)return;schedule=true;queueMicrotask(()=>{schedule=false;syncUi()})};
   new MutationObserver(refresh).observe(root,{childList:true,subtree:true});syncUi();
  }
  document.addEventListener('click',ev=>{
   const b=ev.target?.closest?.('#panelContent .product .productactions button:last-child');if(!b||b.disabled)return;
   const name=b.closest('.product')?.querySelector('.productname')?.textContent.trim();
   if(byName.has(name)&&b.textContent.trim()==='MUA')pending={name,at:performance.now()};
  },true);
 }
 window.NNExtras3D={version:VERSION,handlesPets:true,drawBehind,drawAbove,current:worn,previewEquip,
  partForName:name=>byName.get(name)||null,items:list.map(({id,name,slot})=>({id,name,slot}))};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
