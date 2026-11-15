/* SIÊU NHÂN NÉ NHẬU — V13: 16 NHÂN VẬT 3D NGUYÊN BỘ + PET.
   Không vẽ kính/mũ/tóc/trang sức; không monkey-patch Canvas; giữ nguyên item ID/Supabase.
*/
(()=>{'use strict';
 if(window.NNShop3D)return;
 const VERSION='13.0.0', $=q=>document.querySelector(q);
 const characterImage=new Image(), petImage=new Image();
 characterImage.decoding='async';petImage.decoding='async';
 characterImage.src='shop-base-clean-v11.png?v='+VERSION;
 petImage.src='shop-parts-v11.png?v='+VERSION;
 const ORIGINAL=new Image();ORIGINAL.decoding='async';ORIGINAL.src='shop-3d-atlas.png?v='+VERSION;
 const newHeroes=new Image(),newPets=new Image();
 newHeroes.decoding='async';newPets.decoding='async';
 newHeroes.src='shop-heroes-v13.webp?v='+VERSION;
 newPets.src='shop-pets-v13.webp?v='+VERSION;
 // Each character is a complete 3D render, not separately assembled clothing.
 const LOOKS={
  hero_classic:{key:'classic',col:0,row:0},
  outfit_vest:{key:'vest',col:1,row:0},
  outfit_ninja:{key:'ninja',col:2,row:0},
  outfit_armor:{key:'armor',col:0,row:1},
  outfit_royal:{key:'royal',col:1,row:1},
  hero_sun:{key:'vip',col:2,row:1},
  hero_thunder:{key:'armor',col:0,row:1},// Respect historical purchases.
  hero_king:{key:'royal',col:1,row:1},
  hero_natra:{key:'natra',col:0,row:0,sheet:'v13'},
  hero_monkey:{key:'monkey',col:1,row:0,sheet:'v13'},
  hero_dragon_knight:{key:'dragon_knight',col:2,row:0,sheet:'v13'},
  hero_thunder_god:{key:'thunder_god',col:3,row:0,sheet:'v13'},
  hero_block:{key:'block',col:4,row:0,sheet:'v13'},
  hero_gold_boss:{key:'gold_boss',col:0,row:1,sheet:'v13'},
  hero_traffic:{key:'traffic',col:1,row:1,sheet:'v13'},
  hero_mecha:{key:'mecha',col:2,row:1,sheet:'v13'},
  hero_titan:{key:'titan',col:3,row:1,sheet:'v13'},
  hero_robot_pilot:{key:'robot_pilot',col:4,row:1,sheet:'v13'}
 };
 const PETS={
  pet_dog:[788,394,216,172],pet_cat:[1040,394,224,171],
  pet_chicken:[23,586,209,171],pet_duck:[286,586,195,172],
  pet_pig:[533,586,214,172],pet_dragon:[803,586,186,172],
  pet_panda:[0,0,0,0,'v13',0,0], pet_monkey:[0,0,0,0,'v13',1,0],
  pet_tiger:[0,0,0,0,'v13',2,0], pet_shark:[0,0,0,0,'v13',3,0],
  pet_owl:[0,0,0,0,'v13',4,0], pet_rabbit:[0,0,0,0,'v13',0,1],
  pet_fox:[0,0,0,0,'v13',1,1], pet_turtle:[0,0,0,0,'v13',2,1],
  pet_unicorn:[0,0,0,0,'v13',3,1], pet_robot:[0,0,0,0,'v13',4,1]
 };
 const STAGE_W=735,STAGE_H=443.5,HERO_X=144;
 const ready=()=>!!((characterImage.complete&&characterImage.naturalWidth===1774)||(ORIGINAL.complete&&ORIGINAL.naturalWidth===1774));
 function currentId(e){
  if(e?.outfit&&e.outfit!=='outfit_none'&&LOOKS[e.outfit])return e.outfit;
  return LOOKS[e?.character]?e.character:'hero_classic';
 }
 function currentGear(){try{return window.NNGameEquipment?.()||{character:'hero_classic',outfit:'outfit_none',pet:'pet_none'}}catch{return {character:'hero_classic',outfit:'outfit_none',pet:'pet_none'}}}
 function renderPet(c,id,t,centerX,centerY,w,h){
  const box=PETS[id];if(!box)return false;
  let im=petImage,sx=box[0],sy=box[1],sw=box[2],sh=box[3];
  if(box[4]==='v13'){
   im=newPets;if(!im.complete||!im.naturalWidth)return false;
   sw=im.naturalWidth/5;sh=im.naturalHeight/2;sx=box[5]*sw;sy=box[6]*sh;
  }else if(!im.complete||im.naturalWidth!==1280)return false;
  c.save();c.translate(centerX,centerY+Math.sin(t*5.2+id.length)*8);
  c.rotate(Math.sin(t*3.4)*.035);
  // Pet follows BEHIND the superhero, with movement but never covers the face.
  c.drawImage(im,sx,sy,sw,sh,-w/2,-h/2,w,h);c.restore();return true;
 }
 function drawLook(c,x,y,w,h,gear,t,options={}){
  if(!ready())return false;
  const chosen=options.itemId||currentId(gear),look=LOOKS[chosen]||LOOKS.hero_classic;
  const im=look.sheet==='v13'?newHeroes:((characterImage.complete&&characterImage.naturalWidth===1774)?characterImage:ORIGINAL);
  if(!im.complete||!im.naturalWidth)return false;
  // Both hero and follower use ONE stage transform, with one shared rotation.
  const scale=Math.min(w/STAGE_W,h/STAGE_H);
  const ww=STAGE_W*scale,hh=STAGE_H*scale;
  c.save();c.translate(x+w/2,y+h/2+Math.sin(t*3.6)*1.3);
  c.rotate(Math.sin(t*2.1)*.012);
  c.scale(ww/STAGE_W,hh/STAGE_H);c.translate(-STAGE_W/2,-STAGE_H/2);
  if(options.trail){c.save();c.globalAlpha=.14;c.strokeStyle='#dceeff';c.lineWidth=5;
   for(let k=0;k<3;k++){c.beginPath();c.moveTo(4-k*15,182+k*22);c.lineTo(-33-k*15,182+k*22);c.stroke()}c.restore()}
  // Render pet FIRST, always behind the full character (no baked-in pet on VIP).
  if(options.withPet!==false)renderPet(c,gear?.pet,t,90,292,162,134);
  const sw=im.naturalWidth/(look.sheet==='v13'?5:3),sh=im.naturalHeight/2;
  // Both formats map into the same coordinate stage; no hats, glasses or overlays.
  if(look.sheet==='v13') c.drawImage(im,look.col*sw,look.row*sh,sw,sh,145,9,570,416);
  else c.drawImage(im,look.col*sw,look.row*sh,sw,sh,HERO_X,0,sw,sh);
  c.restore();return true;
 }
 function drawGameHero(c,x,y,w,h,gear,t){return drawLook(c,x,y,w,h,gear,t,{trail:true})}
 function drawPetOnly(c,id,t){
  if(!PETS[id])return false;
  c.clearRect(0,0,c.canvas.width,c.canvas.height);
  const w=c.canvas.width,h=c.canvas.height;
  return renderPet(c,id,t,w*.5,h*.53+Math.sin(t*3)*1,w*.7,h*.8);
 }
 function drawThumbnail(cv,itemId,equip,t){
  const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,cv.width,cv.height);
  if(itemId==='pet_none'){
   c.textAlign='center';c.textBaseline='middle';c.font='bold 42px system-ui';c.fillStyle='#cde6ff';c.fillText('∅',cv.width/2,cv.height/2);return;
  }
  if(itemId in PETS){drawPetOnly(c,itemId,t);return}
  drawLook(c,cv.width*.01,cv.height*.015,cv.width*.98,cv.height*.97,{...equip,pet:'pet_none'},t,{itemId,withPet:false});
 }
 function css(){if($('#nn-charpet-css'))return;const s=document.createElement('style');s.id='nn-charpet-css';s.textContent=`
  #panelContent .tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;overflow:visible;padding:8px 0 12px}
  #panelContent .tabs .tab{width:100%;min-width:0;white-space:normal;font-size:14px;padding:12px 5px}
  #panelContent .preview{max-width:none;height:208px;overflow:hidden;background:radial-gradient(ellipse at 53% 32%,#486cb9,#1b315d 70%,#10193e)}
  #panelContent .nn-cp-preview{display:block;width:100%;height:100%;object-fit:contain}
  #panelContent .previewtag{text-align:center;font-size:12px;color:#ffdf89;margin:9px 0 12px}
  #panelContent .productgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  #panelContent .product.nn-cp-card{display:flex;flex-direction:column;min-width:0;align-items:stretch;padding:8px;gap:5px;background:linear-gradient(150deg,#263e72,#12224d);border:1px solid #759bc8;border-radius:14px}
  #panelContent .product.nn-cp-worn{border:2px solid #ffd46b;padding:7px}
  #panelContent .product.nn-cp-card>div:nth-child(2){width:100%;text-align:center;flex:1}
  #panelContent .productemoji.nn-cp-art{width:100%;height:auto;aspect-ratio:1.5/1;min-height:0;overflow:hidden;display:block;font-size:0;border:1px solid #597da9;background:radial-gradient(ellipse,#4e719e,#1b3158);border-radius:10px}
  #panelContent .productemoji.nn-cp-art canvas{display:block;width:100%;height:100%}
  #panelContent .productname{font-size:12px;line-height:1.25;min-height:30px;color:#fff6e7}
  #panelContent .productdesc{font-size:10px;line-height:1.3;min-height:22px}
  #panelContent .price{font-size:12px;color:#ffe483;font-weight:900}
  #panelContent .productactions{display:flex;grid-column:auto;width:100%;gap:5px}
  #panelContent .shopaction{flex:1;min-width:0;font-size:10px;padding:9px 3px}
  .heroimage.nn-cp-menu>img{display:none!important}
  .heroimage .nn-cp-menu-canvas{height:100%;max-width:95%;object-fit:contain;pointer-events:none}
  #panelContent .nn-cp-subtitle{font-size:11px;color:#cee2ff;text-align:center;margin:0 0 7px}
  @media(max-width:350px){#panelContent .productgrid{gap:6px}#panelContent .product.nn-cp-card{padding:5px}#panelContent .shopaction{font-size:9px}}
 `;document.head.appendChild(s)}
 function paintLoop(){
  const t=performance.now()/1000;
  const panel=$('#panel'),root=$('#panelContent');
  if(panel&&!panel.classList.contains('hidden')&&root?.querySelector('.nn-cp-preview')){
   const pv=root.querySelector('.nn-cp-preview'),c=pv.getContext('2d');
   if(c){c.clearRect(0,0,pv.width,pv.height);
    const base=currentGear(),previewId=root.dataset.previewItem||'';
    const gear={...base};let selectedChar=currentId(base);
    if(previewId in PETS||previewId==='pet_none')gear.pet=previewId;
    else if(LOOKS[previewId])selectedChar=previewId;
    drawLook(c,0,0,pv.width,pv.height,gear,t,{itemId:selectedChar,withPet:true});}
   for(const cv of root.querySelectorAll('canvas.nn-cp-tile'))drawThumbnail(cv,cv.dataset.itemId,currentGear(),t);
  }
  const menu=$('.heroimage'),menuScreen=$('#menu');
  if(menu&&menuScreen&&!menuScreen.classList.contains('hidden')&&ready()){
   let cv=menu.querySelector('canvas.nn-cp-menu-canvas');
   if(!cv){cv=document.createElement('canvas');cv.width=650;cv.height=240;cv.className='nn-cp-menu-canvas';menu.prepend(cv);menu.classList.add('nn-cp-menu')}
   const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);
   drawLook(c,110,0,430,240,currentGear(),t,{withPet:true});
  }
  requestAnimationFrame(paintLoop);
 }
 function init(){css();requestAnimationFrame(paintLoop);
  const wife=$('.over .wife img');if(wife){let attempts=0;const fallback=()=>{if(attempts++===0){wife.src='assets/wife.png'}else{wife.style.display='none';const p=wife.parentNode;if(p&&!p.querySelector('.nn-wife-fallback')){const d=document.createElement('div');d.className='nn-wife-fallback';d.textContent='👩‍🦰🧹 😱🦸';d.style.cssText='height:100%;display:grid;place-items:center;font-size:47px;background:#81485d';p.prepend(d)}}};wife.addEventListener('error',fallback);if(wife.complete&&!wife.naturalWidth)fallback()}
 }
 window.NNShop3D={version:VERSION,looks:LOOKS,pets:PETS,drawGameHero,drawLook,currentId,ready};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
