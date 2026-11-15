/* SIÊU NHÂN NÉ NHẬU — SHOP 3D 5.0
   Six professionally rendered 3D flight costumes. This extension uses the
   original shop actions, wallets, Supabase RPCs, scoring and collision engine.
   No emoji-only replacement hero, no old green/blue outline, no SQL changes.
*/
(()=>{'use strict';
 if(window.NNShop3D)return;
 const VERSION='8.0.0';
 const SHEET='shop-3d-atlas.png?v=8.0.0';
 const $=s=>document.querySelector(s);
 const ALL=Object.freeze([
  {key:'classic',label:'Mặc định',item:'Đồ mặc định',id:'outfit_none',slot:'outfit',price:0,col:0,row:0},
  {key:'vest',label:'Vest Chủ Tịch',item:'Vest Chủ Tịch',id:'outfit_vest',slot:'outfit',price:300,col:1,row:0},
  {key:'ninja',label:'Ninja né nhậu',item:'Ninja né nhậu',id:'outfit_ninja',slot:'outfit',price:430,col:2,row:0},
  {key:'armor',label:'Giáp chiến binh',item:'Giáp chiến binh',id:'outfit_armor',slot:'outfit',price:780,col:0,row:1},
  {key:'royal',label:'Long bào đại gia',item:'Long bào đại gia',id:'outfit_royal',slot:'outfit',price:1250,col:1,row:1},
  {key:'vip',label:'Siêu nhân VIP',item:'Siêu nhân kim cương',id:'hero_sun',slot:'character',price:1050,col:2,row:1}
 ]);
 const LOOKUP=new Map(ALL.map(s=>[s.item,s]));
 const IDLOOKUP=new Map(ALL.map(s=>[s.id,s]));
 const FRAME={character:'hero_classic',outfit:'outfit_none',pet:'pet_none'};
 const image=new Image();image.decoding='async';image.src=SHEET;
 const approved=new Image();approved.decoding='async';approved.src='shop-approved-combos-v8.webp?v=8.0.0';
 const approvedLooks={'hat_cowboy|glasses_black':[0,0],'hat_crown|glasses_star':[1,0],'hat_helmet|glasses_black':[0,1],'hat_cap|glasses_heart':[1,1]};
 let online=false,playerId='',onlineLook={...FRAME},previewLook=null,lastSkin=null,onlineOwned=new Set();
 let previewCanvas=null,tiles=[],gallery=[],pending=null,animating=false;
 let modeKey='nn3d-last-guest',requestedAuth=0,lastPreviewPaint=0,lastTilePaint=0,lastMenuPaint=0;
 const oldDraw=CanvasRenderingContext2D.prototype.drawImage;
 const oldFill=CanvasRenderingContext2D.prototype.fillText;
 const oldStroke=CanvasRenderingContext2D.prototype.stroke;
 const VALID_KEYS=new Set(ALL.map(x=>x.key));
 const COLORS=['#bbaaff','#9ffbff','#ffdd74'];
 function isGame(c){return c?.canvas?.id==='game'}
 function guestEquip(){try{return {...FRAME,...(JSON.parse(localStorage.getItem('nn3-guest')||'{}').equip||{})}}catch{return {...FRAME}}}
 function equip(){return online?onlineLook:guestEquip()}
 function readLast(){try{const v=localStorage.getItem(modeKey);return VALID_KEYS.has(v)?v:null}catch{return null}}
 function setLast(s){if(!s)return;lastSkin=s.key;try{localStorage.setItem(modeKey,s.key)}catch{}}
 function keyFromGear(e){
  if(e.outfit==='outfit_vest')return 'vest';
  if(e.outfit==='outfit_ninja')return 'ninja';
  if(e.outfit==='outfit_armor')return 'armor';
  if(e.outfit==='outfit_royal')return 'royal';
  if(e.character==='hero_sun')return 'vip';
  if(e.character==='hero_king')return 'royal';
  if(e.character==='hero_thunder')return 'armor';
  return 'classic';
 }
 function isValidChoice(key,e){
  if(key==='classic')return e.outfit==='outfit_none'&&e.character==='hero_classic';
  const s=ALL.find(x=>x.key===key);return s&&(e[s.slot]===s.id);
 }
 function activeSprite(){
  const e=equip();const key=lastSkin||readLast();
  if(key&&isValidChoice(key,e))return ALL.find(x=>x.key===key);
  return ALL.find(x=>x.key===keyFromGear(e))||ALL[0];
 }
 function byName(name){
  if(LOOKUP.has(name))return LOOKUP.get(name);
  if(name==='Siêu nhân sấm sét')return ALL[3];
  if(name==='Siêu nhân đại gia')return ALL[4];
  if(name==='Siêu nhân đỏ')return ALL[0];
  return null;
 }
 function selectedPreview(){
  const txt=$('#panelContent .previewtag')?.textContent||'';
  const m=txt.match(/^✨ ĐANG THỬ:\s*(.+)$/);
  if(m){const c=byName(m[1]);if(c)return c}
  return activeSprite();
 }
 function renderSprite(c,x,y,w,h,look,t,opts={}){
  if(!image.complete||!image.naturalWidth)return false;
  const sw=image.naturalWidth/3,sh=image.naturalHeight/2;
  // Preserve the original 3D artwork's proportions, even in a wide preview.
  const ratio=sw/sh,target=w/h;
  if(target>ratio){x+=(w-h*ratio)/2;w=h*ratio}
  else{y+=(h-w/ratio)/2;h=w/ratio}
  const flt=Math.sin(t*3.7+look.col)*1.6;
  c.save();c.translate(x+w/2,y+h/2+flt);c.rotate(Math.sin(t*2.15+look.row)*.012);
  if(opts.trail){
   c.globalAlpha=.15;
   c.strokeStyle='#d9eaff';c.lineWidth=1.6;
   for(let k=0;k<3;k++){
    const xx=-w*.47-k*9-Math.sin(t*7+k)*3;
    c.beginPath();c.moveTo(xx,-h*.18+k*9);c.lineTo(xx-18-k*4,-h*.18+k*9);c.stroke();
   }
   c.globalAlpha=1;
  }
  // V7: pet and costume attachments inherit EXACTLY the same rotation, float
  // and source-to-screen scale as the hero, avoiding drifting hats and glasses.
  const gear=window.NNExtras3D;
  const eq=opts.equipment||gear?.current?.()||{};
  // Exact approved 3D renders for 4 frequently paired hat/glasses looks.
  // A single baked image eliminates coordinate drift, double-eyes and floating headwear.
  // Only use these for the classic suit; other outfits retain their real artwork.
  const pair=look.key==='classic'&&eq.hair!=='hair_red'&&eq.hair!=='hair_blue'&&eq.hair!=='hair_rock'
    ?approvedLooks[(eq.hat||'hat_none')+'|'+(eq.glasses||'glasses_none')]:null;
  const canBake=!!pair&&approved.complete&&approved.naturalWidth>=1448;
  if(gear?.drawBehind)gear.drawBehind(c,w,h,t,eq);
  if(canBake){
   oldDraw.call(c,approved,pair[0]*724,pair[1]*543,724,543,-w/2,-h/2,w,h);
   // Hat and eyewear are already inside the approved image. Add any necklace separately.
   if(gear?.drawAbove)gear.drawAbove(c,w,h,t,{...eq,hat:'hat_none',glasses:'glasses_none',hair:'hair_none'});
  }else{
   oldDraw.call(c,image,look.col*sw,look.row*sh,sw,sh,-w/2,-h/2,w,h);
   if(gear?.drawAbove)gear.drawAbove(c,w,h,t,eq);
  }
  c.restore();return true;
 }
 // Replace only the legacy hero sprite inside the original gameplay canvas.
 // Collision, movement and gameplay mechanics remain untouched.
 CanvasRenderingContext2D.prototype.drawImage=function(src,...a){
  if(isGame(this)&&src instanceof HTMLImageElement&&/\/assets\/hero\.png(?:[?#]|$)/.test(src.src||'')&&a.length===4&&a[2]===160&&a[3]===113){
   if(renderSprite(this,a[0],a[1],a[2],a[3],activeSprite(),performance.now()/1000,{trail:true}))return;
  }
  return oldDraw.call(this,src,...a);
 };
 // Old game emoji overlays do not match the baked 3D costumes. Hide only those
 // old accessory labels; keep HUD text, pets, powers and other gameplay intact.
 CanvasRenderingContext2D.prototype.fillText=function(txt,x,y,...a){
  if(isGame(this)&&((x===-13&&y===9)||(x===13&&y===-45)||(x===11&&y===-11)||(x===11&&y===-49)||(x===8&&y===17)))return;
  return oldFill.call(this,txt,x,y,...a);
 };
 // Cosmetic hero_class rings caused the colored outline; safety rings remain.
 CanvasRenderingContext2D.prototype.stroke=function(...a){
  if(isGame(this)&&Math.abs(this.lineWidth-3.5)<.04&&COLORS.includes(String(this.strokeStyle).toLowerCase()))return;
  return oldStroke.apply(this,a);
 };
 function css(){if($('#nn3d-css'))return;const s=document.createElement('style');s.id='nn3d-css';s.textContent=`
  #panelContent .tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;gap:5px;padding:7px 0 12px}
  #panelContent .tabs .tab{padding:9px 2px;min-width:0;font-size:10px;white-space:normal;line-height:1.2}
  #panelContent .preview{height:190px!important;max-width:none!important;background:radial-gradient(ellipse at 55% 30%,#4d78bf,#1c376b 70%,#0f1b42)!important;overflow:hidden!important}
  #panelContent .preview-hero,#panelContent .preview-gear,#panelContent .preview-pet{display:none!important}
  #panelContent .nn3d-preview{display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  #panelContent .productgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  #panelContent .product{min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:5px;padding:8px;border:1px solid #7198d0;border-radius:13px}
  #panelContent .product>div:nth-child(2){width:100%;text-align:center;flex:1}
  #panelContent .productemoji.nn3d-art{display:block;width:100%;height:auto;min-height:0;aspect-ratio:1.45/1;overflow:hidden;font-size:0!important;background-image:none!important;background:radial-gradient(ellipse at center,#4b70a7,#1a2e57)}
  #panelContent .productemoji.nn3d-art canvas{display:block;width:100%;height:100%;pointer-events:none}
  #panelContent .productname{font-size:12px;min-height:29px;line-height:1.2;color:#fff3d9}
  #panelContent .productdesc{font-size:10px;line-height:1.35;min-height:24px}
  #panelContent .productactions{grid-column:auto;display:flex;width:100%;gap:4px}
  #panelContent .shopaction{min-width:0;flex:1;font-size:10px;padding:9px 4px}
  #panelContent .product.nn3d-worn{border-color:#ffe37d;box-shadow:0 0 0 1px #e4bf60aa}
  #panelContent .nn3d-title{display:flex;align-items:center;justify-content:space-between;margin:12px 0 7px;color:#fff0af;font-weight:950;font-size:12px}
  #panelContent .nn3d-title small{color:#b9d5ff;font-size:9px}
  #panelContent .nn3d-collection{display:flex;gap:9px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;padding:3px 1px 12px}
  #panelContent .nn3d-look{scroll-snap-align:start;flex:0 0 min(42%,161px);background:linear-gradient(150deg,#213f7b,#0e2253);border:1px solid #537dba;border-radius:13px;overflow:hidden;padding:5px 5px 7px;box-shadow:0 4px 0 #081228}
  #panelContent .nn3d-look.nn3d-worn{border:2px solid #ffd978;padding:4px 4px 6px}
  #panelContent .nn3d-look canvas{display:block;aspect-ratio:1.45 / 1;width:100%;background:radial-gradient(ellipse at 55% 34%,#4b75a9,#1b345f 69%);border-radius:9px}
  #panelContent .nn3d-name{min-height:32px;font-size:10px;text-align:center;font-weight:950;color:#fff8de;padding:4px 0 2px}
  #panelContent .nn3d-price{font-size:11px;text-align:center;color:#ffe083;font-weight:900;padding:0 0 6px}
  #panelContent .nn3d-actions{display:grid;grid-template-columns:1fr 1fr;gap:3px}
  #panelContent .nn3d-actions button{font-size:9px;font-weight:950;border:1px solid #9cbbff;background:#1f427d;border-radius:7px;color:#f7faff;padding:8px 1px;touch-action:manipulation}
  #panelContent .nn3d-actions button:last-child{background:linear-gradient(#fff19a,#f6ae36);border-color:#ffeaa4;color:#482b16}
  #panelContent .nn3d-note{text-align:center;font-size:10px;color:#c4ddff;margin:7px 0 10px}
  .heroimage.nn3d-menu>img{display:none!important}
  .heroimage .nn3d-menu-canvas{width:min(94%,370px);height:100%;object-fit:contain;display:block;pointer-events:none}
  .over .wife > img {object-fit:contain!important;object-position:center center!important}
  @media(max-width:350px){#panelContent .nn3d-look{flex-basis:47%}#panelContent .productgrid{gap:6px}}
  `;document.head.appendChild(s);
 }
 function makeEl(tag,cl,txt){const el=document.createElement(tag);if(cl)el.className=cl;if(txt!==undefined)el.textContent=txt;return el}
 function switchAndAct(spec,verb){
  const root=$('#panelContent');if(!root)return;
  const tabIndex=spec.slot==='character'?0:1;
  const tab=root.querySelectorAll('.tabs .tab')[tabIndex];if(!tab)return;
  tab.click(); // Run original game shop tab handler.
  const card=[...root.querySelectorAll('.product')].find(el=>el.querySelector('.productname')?.textContent.trim()===spec.item);
  if(!card)return;
  const buttons=card.querySelectorAll('.productactions button');
  if(verb==='try'){buttons[0]?.click();return}
  const primary=buttons[buttons.length-1];
  if(!primary||primary.disabled)return;
  const label=primary.textContent.trim();
  if(label==='MUA'||label==='MẶC'){pending={item:spec.item,type:label,time:performance.now()};primary.click()}
 }
 function worn(spec){const e=equip();return e[spec.slot]===spec.id && activeSprite().key===spec.key}
 function galleryInit(root){
  if(root.querySelector('.nn3d-collection'))return;
  const title=makeEl('div','nn3d-title');title.append(makeEl('span','', '✨ BỘ SƯU TẬP SIÊU NHÂN 3D'),makeEl('small','', 'VUỐT ĐỂ XEM 6 BỘ'));
  const strip=makeEl('div','nn3d-collection');gallery=[];
  for(const spec of ALL){
   const card=makeEl('article','nn3d-look');const cv=makeEl('canvas');cv.width=310;cv.height=214;
   const n=makeEl('div','nn3d-name',spec.label),price=makeEl('div','nn3d-price',spec.price?spec.price.toLocaleString('vi-VN')+' 🪙':'MIỄN PHÍ');
   const actions=makeEl('div','nn3d-actions');const tryB=makeEl('button','','THỬ'),buyB=makeEl('button','','MUA/MẶC');
   tryB.type='button';buyB.type='button';tryB.addEventListener('click',()=>switchAndAct(spec,'try'));buyB.addEventListener('click',()=>switchAndAct(spec,'buy'));
   actions.append(tryB,buyB);card.append(cv,n,price,actions);strip.append(card);gallery.push({cv,spec,card});
  }
  const pv=root.querySelector('.previewtag')||root.querySelector('.preview');if(!pv)return;
  const note=makeEl('p','nn3d-note','Mua xong tự mặc • Vào màn chơi sẽ bay với đúng trang phục đã chọn');
  pv.insertAdjacentElement('afterend',title);title.after(strip,note);
 }
 function parseUiLook(){
  const label=$('#panelContent .previewtag')?.textContent||'';
  if(!online)return;
  if(!label.startsWith('✨ ĐANG MẶC:'))return;
  const e={...FRAME};
  for(const [name,id,slot] of [
   ['Siêu nhân sấm sét','hero_thunder','character'],['Siêu nhân kim cương','hero_sun','character'],['Siêu nhân đại gia','hero_king','character'],
   ['Vest Chủ Tịch','outfit_vest','outfit'],['Ninja né nhậu','outfit_ninja','outfit'],['Giáp chiến binh','outfit_armor','outfit'],['Long bào đại gia','outfit_royal','outfit']
  ])if(label.includes(name))e[slot]=id;
  // Cloud is authoritative; this preview label is emitted by game's equipped().
  onlineLook={...onlineLook,...e};
 }
 function syncFromUi(){
  const panel=$('#panel'),root=$('#panelContent');if(!root||panel?.classList.contains('hidden')||!root.querySelector('.productgrid')){previewCanvas=null;tiles=[];gallery=[];return}
  if(online)parseUiLook();
  previewLook=selectedPreview();
  let pv=root.querySelector('.preview');if(pv){
   previewCanvas=pv.querySelector('canvas.nn3d-preview');if(!previewCanvas){previewCanvas=makeEl('canvas','nn3d-preview');previewCanvas.width=620;previewCanvas.height=270;pv.append(previewCanvas)}
  }
  for(const card of root.querySelectorAll('.product')){
   const name=card.querySelector('.productname')?.textContent.trim();const host=card.querySelector('.productemoji');if(!host)continue;
   if(!host.classList.contains('nn3d-art')){
     host.replaceChildren();host.classList.add('nn3d-art');const cv=makeEl('canvas');cv.width=288;cv.height=190;host.append(cv);
   }
   const item=byName(name);
   card.classList.toggle('nn3d-worn',!!item&&worn(item));
  }
  tiles=[...root.querySelectorAll('.product')].map(card=>({
   cv:card.querySelector('.nn3d-art canvas'),item:byName(card.querySelector('.productname')?.textContent.trim()),name:card.querySelector('.productname')?.textContent.trim()
  })).filter(x=>x.cv);
  galleryInit(root);
  const current=activeSprite();for(const {card,spec} of gallery){
   const wearing=worn(spec);card.classList.toggle('nn3d-worn',wearing);
   const action=card.querySelector('.nn3d-actions button:last-child');
   let owned=spec.price===0;
   if(online){owned ||= onlineOwned.has(spec.id)}
   else try{owned ||= (JSON.parse(localStorage.getItem('nn3-guest')||'{}').items||[]).includes(spec.id)}catch{}
   const next=wearing?'✓ ĐANG MẶC':owned?'MẶC':'MUA';
   if(action&&action.textContent!==next)action.textContent=next;
   if(action)action.disabled=wearing;
  }
  if(pending){
   if(performance.now()-pending.time>12000){pending=null;return}
   const card=[...root.querySelectorAll('.product')].find(el=>el.querySelector('.productname')?.textContent.trim()===pending.item);
   const b=card?.querySelector('.productactions button:last-child');
   const spec=byName(pending.item);
   if(b&&b.textContent.includes('ĐANG DÙNG')){setLast(spec);pending=null}
   else if(b&&pending.type==='MUA'&&b.textContent.trim()==='MẶC'){
    if(online)onlineOwned.add(spec?.id);
    pending.type='MẶC';const currentButton=b;
    setTimeout(()=>{if(currentButton.isConnected&&currentButton.textContent.trim()==='MẶC')currentButton.click()},0);
   }
  }
 }
 function drawCanvas(cv,spec,t,trail=false,itemName='',isPreview=false){
  if(!cv?.isConnected)return;const c=cv.getContext('2d');if(!c)return;
  const w=cv.width,h=cv.height;c.clearRect(0,0,w,h);
  const boxW=w*.99,boxH=h*.93;
  const gear=window.NNExtras3D;
  let eq=isPreview?gear?.previewEquip?.():null;
  if(!eq&&itemName){const item=gear?.partForName?.(itemName);if(item)eq={...gear.current(),[item.slot]:item.id}}
  renderSprite(c,(w-boxW)/2,(h-boxH)/2,boxW,boxH,spec,t,{trail,equipment:eq||undefined});
 }
 function paintLoop(){
  const t=performance.now()/1000;
  if(previewCanvas?.isConnected&&t-lastPreviewPaint>.033){lastPreviewPaint=t;drawCanvas(previewCanvas,previewLook||activeSprite(),t,true,'',true)}
  if(t-lastTilePaint>.095){lastTilePaint=t;
   for(const {cv,item,name} of tiles)drawCanvas(cv,item||activeSprite(),t,false,name);
   for(const {cv,spec} of gallery)drawCanvas(cv,spec,t);
  }
  if(t-lastMenuPaint>.033){
   lastMenuPaint=t;const menu=$('#menu'),heroImg=$('.heroimage');
   if(menu&&!menu.classList.contains('hidden')&&heroImg){
    let cv=heroImg.querySelector('canvas.nn3d-menu-canvas');if(!cv){cv=makeEl('canvas','nn3d-menu-canvas');cv.width=660;cv.height=230;heroImg.prepend(cv);heroImg.classList.add('nn3d-menu')}
    const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);renderSprite(c,125,0,420,230,activeSprite(),t,true);
   }
  }
  requestAnimationFrame(paintLoop);
 }
 async function fetchOnlineEquipment(){
  const ticket=++requestedAuth,config=window.NN_CLOUD||{};
  if(!online||!window.supabase||!config.url||!config.anonKey)return;
  try{
   const client=window.supabase.createClient(config.url,config.anonKey,{auth:{detectSessionInUrl:false}});
   const {data}=await client.auth.getSession();const id=data?.session?.user?.id;if(!id||ticket!==requestedAuth)return;
   playerId=id;modeKey='nn3d-last-online:'+id;lastSkin=readLast();
   const [result,ownedResult]=await Promise.all([
    client.from('players').select('equipped').eq('id',id).single(),
    client.from('owned_items').select('item_id').eq('player_id',id)
   ]);
   if(ticket!==requestedAuth)return;
   if(!result.error&&result.data?.equipped)onlineLook={...FRAME,...result.data.equipped};
   if(!ownedResult.error)onlineOwned=new Set((ownedResult.data||[]).map(o=>o.item_id));
  }catch{/* Existing game remains usable offline. */}
 }
 function observeMode(){const state=$('#state');if(!state)return;const check=()=>{
  const value=(state.textContent||'').includes('ONLINE');if(value===online)return;
  online=value;playerId='';modeKey=online?'nn3d-last-online-temporary':'nn3d-last-guest';lastSkin=readLast();
  if(online)fetchOnlineEquipment();else {onlineLook={...FRAME};onlineOwned=new Set();requestedAuth++}
 };check();new MutationObserver(check).observe(state,{childList:true,characterData:true,subtree:true})}
 function init(){css();observeMode();const root=$('#panelContent');if(root){let scheduled=false;
  const observer=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;syncFromUi()})};
  new MutationObserver(observer).observe(root,{childList:true,subtree:true});syncFromUi();
 }
 document.addEventListener('click',ev=>{
  const button=ev.target?.closest?.('#panelContent .product .productactions button:last-child');if(!button||button.disabled)return;
  const item=button.closest('.product')?.querySelector('.productname')?.textContent.trim(),spec=byName(item);if(!spec)return;
  const label=button.textContent.trim();if(label==='MUA'||label==='MẶC')pending={item,type:label,time:performance.now()};
 },true);
 const wife=$('.over .wife img');if(wife){let attempts=0;
  const fallback=()=>{if(attempts++===0){wife.src='assets/wife.png';return}wife.style.display='none';const holder=wife.parentElement;if(holder&&!holder.querySelector('.nn3d-wife-fallback')){
   const f=makeEl('div','nn3d-wife-fallback','👩‍🦰🧹 😱🦸');f.style.cssText='display:grid;place-items:center;height:100%;background:#754c69;font-size:52px';holder.prepend(f)
  }};wife.addEventListener('error',fallback);if(wife.complete&&!wife.naturalWidth)fallback();
 }
 requestAnimationFrame(paintLoop);
 }
 window.NNShop3D={version:VERSION,looks:ALL,active:()=>activeSprite().key,refresh:syncFromUi};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
