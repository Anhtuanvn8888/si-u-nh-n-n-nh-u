/* SIÊU NHÂN NÉ NHẬU — SHOP-ONLY ART.
 * Không thay drawHero, không đụng canvas#game, không đổi dữ liệu/vàng/Supabase.
 * Chỉ trang trí DOM của #panelContent, giữ hình hero.png gốc.
 */
(()=>{'use strict';
const IMG='shop-atlas.png?v=20261115c';
const ITEMS=[
'Siêu nhân sấm sét','Siêu nhân kim cương','Siêu nhân đại gia',
'Vest Chủ Tịch','Ninja né nhậu','Giáp chiến binh','Long bào đại gia',
'Tóc lửa','Tóc xanh','Tóc rock','Kính đen','Kính trái tim','Kính ngôi sao',
'Mũ lưỡi trai','Mũ cao bồi','Vương miện','Mũ chiến binh',
'Dây chuyền vàng','Huy chương','Kim cương',
'Chó siêu nhân','Mèo phi hành','Gà chiến bay','Vịt phi công','Lợn tên lửa','Rồng con'
];
const LOOKUP=new Map(ITEMS.map((name,index)=>[name,index]));
const CSS=`
/* Mọi CSS đều chỉ áp dụng cho shop; không sửa hero đang chơi. */
#panelContent .tabs {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;gap:5px;padding:7px 0 12px}
#panelContent .tabs .tab {padding:9px 3px;min-width:0;font-size:10px;white-space:normal;line-height:1.2}
#panelContent .preview {height:182px;max-width:none;overflow:hidden;background:radial-gradient(ellipse at 55% 32%,#4f83d3 0%,#1e366e 58%,#111a43 100%);border:2px solid #e9bf69;box-shadow:inset 0 0 24px #93bff833}
#panelContent .preview-hero {height:166px;min-width:170px;display:grid;place-items:center;filter:drop-shadow(0 8px 11px #0009)}
#panelContent .preview-hero img {display:block;width:min(70vw,230px);height:160px;object-fit:contain;animation:nnFloat 2.4s ease-in-out infinite alternate}
#panelContent .preview-gear {z-index:2;font-size:26px;filter:drop-shadow(0 4px 2px #1118)}
#panelContent .preview-pet {z-index:2}
#panelContent .nn-preview-product {position:absolute;z-index:4;bottom:5px;right:8px;width:76px;height:76px;border:2px solid #ffd36e;border-radius:16px;box-shadow:0 3px 12px #0009;background-color:#122c51;background-image:url('${IMG}');background-size:600% 500%}
#panelContent .nn-preview-product::after {content:'ĐANG THỬ';position:absolute;left:0;right:0;bottom:-2px;text-align:center;background:#ffcb4f;color:#46250d;border-radius:0 0 12px 12px;font-size:8px;font-weight:1000;padding:2px 0}
#panelContent .productgrid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#panelContent .product {min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:5px;padding:8px;border:1.5px solid #759ddb;border-radius:14px;background:linear-gradient(150deg,#263f78,#131f4c);box-shadow:0 4px 0 #070f29;position:relative}
#panelContent .product:hover,#panelContent .product:focus-within {border-color:#ffdf8b}
#panelContent .productemoji {width:100%;height:auto;min-height:0;aspect-ratio:1 / 1;display:grid;place-items:center;font-size:54px;overflow:hidden;border:1px solid #a8b9da;border-radius:11px;background:radial-gradient(circle,#405b96,#15274e);color:#fff}
#panelContent .productemoji.nn-art {font-size:0;background-image:url('${IMG}');background-size:600% 500%;image-rendering:auto}
#panelContent .product>div:nth-child(2) {width:100%;text-align:center;flex:1}
#panelContent .productname {font-size:12px;line-height:1.3;color:#fff4dc;min-height:31px;font-weight:950}
#panelContent .productdesc {font-size:10px;line-height:1.3;min-height:26px}
#panelContent .price {font-size:13px;color:#ffdb65;font-weight:950}
#panelContent .productactions {grid-column:auto;display:flex;width:100%;gap:4px}
#panelContent .shopaction {min-width:0;flex:1;font-size:10px;padding:9px 3px}
#panelContent .nn-shop-caption {text-align:center;color:#ffe2a5;font-size:11px;font-weight:750;margin:7px 0 13px}
@keyframes nnFloat {to {transform:translateY(-7px) rotate(2deg)}}
@media (max-width:350px) {#panelContent .productgrid{gap:6px}#panelContent .product{padding:5px}#panelContent .shopaction{font-size:9px}}
@media (prefers-reduced-motion:reduce){#panelContent .preview-hero img{animation:none}}
/* Wife image: show whole artwork on mobile, keep graceful PNG/emoji fallback. */
.over .wife > img {object-fit:contain!important;object-position:center center!important}
`;
function setSpritePosition(el,idx){const col=idx%6,row=Math.floor(idx/6);el.style.backgroundPosition=(col*20)+'% '+(row*25)+'%'}
function showArt(){const panel=document.getElementById('panel'),root=document.getElementById('panelContent');
if(!root||!panel||panel.classList.contains('hidden')||!root.querySelector('.productgrid'))return;
let cards=0;
for(const card of root.querySelectorAll('.product')){
 const name=card.querySelector('.productname')?.textContent.trim();const host=card.querySelector('.productemoji');const idx=LOOKUP.get(name);
 if(host&&idx!==undefined&&host.dataset.nnGallery!=='1'){
  host.dataset.nnGallery='1';host.classList.add('nn-art');host.textContent='';host.setAttribute('role','img');host.setAttribute('aria-label','Hình sản phẩm '+name);setSpritePosition(host,idx);cards++;
 }
}
const pv=root.querySelector('.preview');if(!pv)return;
const hero=pv.querySelector('.preview-hero');
if(hero&&!hero.querySelector('img')){
 const backup=hero.textContent;hero.textContent='';const image=new Image();image.src='assets/hero.png';image.alt='Siêu nhân nguyên bản';image.onerror=()=>{hero.textContent=backup||'🦸'};hero.append(image);
}
const text=root.querySelector('.previewtag')?.textContent||'';
const label='✨ ĐANG THỬ: ';
const selected=text.startsWith(label)?text.slice(label.length).trim():null;
let thumbnail=pv.querySelector('.nn-preview-product');const idx=LOOKUP.get(selected);
if(idx===undefined){thumbnail?.remove();return}
if(!thumbnail){thumbnail=document.createElement('div');thumbnail.className='nn-preview-product';pv.append(thumbnail)}
thumbnail.title='Hình đang thử: '+selected;thumbnail.setAttribute('role','img');thumbnail.setAttribute('aria-label',selected);setSpritePosition(thumbnail,idx);
}
function wifeSafety(){const holder=document.querySelector('.over .wife');const img=holder?.querySelector('img');if(!img||img.dataset.nnFallback)return;img.dataset.nnFallback='1';
 let stage=0;img.addEventListener('error',()=>{if(stage++===0){img.src='assets/wife.png'}else{img.style.display='none';if(!holder.querySelector('.nn-wife-emoji')){const e=document.createElement('div');e.className='nn-wife-emoji';e.textContent='👩‍🦰🧹 😨🦸';e.style.cssText='height:100%;display:grid;place-items:center;font-size:48px;background:#754465';holder.prepend(e)}}});
 if(img.complete&&!img.naturalWidth)img.dispatchEvent(new Event('error'));
}
function init(){const style=document.createElement('style');style.textContent=CSS;document.head.appendChild(style);wifeSafety();const root=document.getElementById('panelContent');if(!root)return;let scheduled=false;
 const refresh=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;showArt()})};
 new MutationObserver(refresh).observe(root,{childList:true,subtree:true});showArt();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
