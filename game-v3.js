/* SIÊU NHÂN NÉ NHẬU 3.0 — chơi và shop miễn phí, không cần thư viện ngoài.
   Chỉ khi bật cloud-config.js mới có tài khoản và TOP online. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false}),W=390;
const KEY='nn3-guest',GKEY='sieu-nhan-ne-nhau-v1-bankGold';
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),random=(a,b)=>a+Math.random()*(b-a),one=a=>a[Math.floor(Math.random()*a.length)],money=x=>Math.max(0,Number(x)||0).toLocaleString('vi-VN');
const GEAR=[
 ['hero_classic','character','Siêu nhân đỏ',0,'🦸','Huyền thoại né nhậu'],['hero_thunder','character','Siêu nhân sấm sét',420,'⚡','Hào quang tia chớp'],['hero_sun','character','Siêu nhân kim cương',1050,'💎','Hào quang xanh sáng chói'],['hero_king','character','Siêu nhân đại gia',2200,'👑','Hào quang vàng rực'],
 ['outfit_none','outfit','Đồ mặc định',0,'🦸','Nhẹ nhàng'],['outfit_vest','outfit','Vest Chủ Tịch',300,'🤵','Lịch lãm để vợ tha'],['outfit_ninja','outfit','Ninja né nhậu',430,'🥷','Né nhanh hơn lời mời'],['outfit_armor','outfit','Giáp chiến binh',780,'🛡️','Giáp xịn (chỉ trang trí)'],['outfit_royal','outfit','Long bào đại gia',1250,'🥋','Bay như hoàng thượng'],
 ['hair_none','hair','Tóc mặc định',0,'🙂','Gọn gàng'],['hair_red','hair','Tóc lửa',160,'🔥','Đỏ cháy'],['hair_blue','hair','Tóc xanh',180,'💙','Đầu xanh'],['hair_rock','hair','Tóc rock',260,'🎸','Chuẩn dân chơi'],
 ['glasses_none','glasses','Không kính',0,'🙂','Mặt mộc'],['glasses_black','glasses','Kính đen',125,'🕶️','Ngầu khỏi bàn'],['glasses_heart','glasses','Kính trái tim',180,'😍','Chất lãng tử'],['glasses_star','glasses','Kính ngôi sao',300,'🌟','Ngôi sao đường phố'],
 ['hat_none','hat','Đầu trần',0,'🙂','Đón gió'],['hat_cap','hat','Mũ lưỡi trai',140,'🧢','Mũ bụi bặm'],['hat_cowboy','hat','Mũ cao bồi',240,'🤠','Cao bồi miền Tây'],['hat_crown','hat','Vương miện',750,'👑','Vua né nhậu'],['hat_helmet','hat','Mũ chiến binh',680,'🪖','Chiến đấu hết mình'],
 ['jewel_none','jewelry','Không trang sức',0,'🙂','Đơn giản'],['jewel_chain','jewelry','Dây chuyền vàng',250,'📿','Sáng lấp lánh'],['jewel_medal','jewelry','Huy chương',490,'🥇','Huyền thoại thể thao'],['jewel_diamond','jewelry','Kim cương',1250,'💎','Rực cả bầu trời'],
 ['hero_natra','character','Bé Na Tra Lửa Đỏ',690,'🔥','Thần đồng hỏa luân'],
 ['hero_monkey','character','Hầu Vương Thiên Cung',950,'🐒','Hầu vương bay trên mây'],
 ['hero_dragon_knight','character','Tiểu Long Tướng',1150,'🐲','Chiến binh long văn'],
 ['hero_thunder_god','character','Chiến Thần Lôi Điện',1400,'⚡','Thần sấm mạnh mẽ'],
 ['hero_block','character','Khối Vuông Phi Hành',620,'🧱','Siêu nhân khối vuông'],
 ['hero_gold_boss','character','Đại Gia Vest Vàng',1700,'💰','Đại gia toàn vàng'],
 ['hero_traffic','character','Siêu Nhân Giao Thông',980,'🚦','Cảnh sát giao thông bay'],
 ['hero_mecha','character','Mecha Hộ Vệ',1800,'🤖','Robot giáp đỏ xanh'],
 ['hero_titan','character','Titan Cánh Thép',2450,'🦾','Robot giáp cánh vàng'],
 ['hero_robot_pilot','character','Phi Công Người Máy',2100,'🚀','Phi công phản lực'],
 ['pet_panda','pet','Gấu trúc siêu nhân',560,'🐼','Gấu trúc bay cùng'],
 ['pet_monkey','pet','Khỉ con phi hành',590,'🐵','Khỉ con siêu lầy'],
 ['pet_tiger','pet','Hổ con siêu tốc',760,'🐯','Hổ nhỏ áo choàng'],
 ['pet_shark','pet','Cá mập tên lửa',920,'🦈','Cá mập phản lực'],
 ['pet_owl','pet','Cú mèo thám tử',650,'🦉','Cú mèo tinh mắt'],
 ['pet_rabbit','pet','Thỏ phi công',490,'🐰','Thỏ bay dễ thương'],
 ['pet_fox','pet','Cáo lửa',740,'🦊','Cáo bay siêu nhanh'],
 ['pet_turtle','pet','Rùa hộ vệ',780,'🐢','Rùa bay bền bỉ'],
 ['pet_unicorn','pet','Kỳ lân cầu vồng',1550,'🦄','Kỳ lân phép thuật'],
 ['pet_robot','pet','Robot trợ lý',1350,'🤖','Robot bay phát sáng'],
 ['pet_none','pet','Không có pet',0,'➖','Bay một mình'],['pet_dog','pet','Chó siêu nhân',350,'🐶','Cún áo choàng đỏ'],['pet_cat','pet','Mèo phi hành',380,'🐱','Meo meo trên mây'],['pet_chicken','pet','Gà chiến bay',410,'🐔','Cục tác phản lực'],['pet_duck','pet','Vịt phi công',450,'🦆','Quạc quạc trên không'],['pet_pig','pet','Lợn tên lửa',620,'🐷','Ụt ịt vượt gió'],['pet_dragon','pet','Rồng con',1500,'🐉','Pet siêu VIP']
].map(a=>({id:a[0],slot:a[1],name:a[2],price:a[3],emoji:a[4],desc:a[5]}));
const BY=Object.fromEntries(GEAR.map(x=>[x.id,x]));
// V13 extends character and pet catalog; keep other old ownership records hidden and intact.
const GROUPS=[['character','🦸 Nhân vật 3D'],['pet','🐾 Thú cưng']];
const CHAR_IDS=['hero_classic','outfit_vest','outfit_ninja','outfit_armor','outfit_royal','hero_sun',
'hero_natra','hero_monkey','hero_dragon_knight','hero_thunder_god','hero_block',
'hero_gold_boss','hero_traffic','hero_mecha','hero_titan','hero_robot_pilot'];
const LEGACY_CHAR_IDS=['hero_thunder','hero_king'];
const PET_IDS=['pet_none','pet_dog','pet_cat','pet_chicken','pet_duck','pet_pig','pet_dragon',
'pet_panda','pet_monkey','pet_tiger','pet_shark','pet_owl','pet_rabbit','pet_fox','pet_turtle','pet_unicorn','pet_robot'];
function characterItems(){
 const list=CHAR_IDS.slice();
 for(const id of LEGACY_CHAR_IDS)if(getOwned(BY[id])||equipped()[BY[id].slot]===id)list.push(id);
 return list.map(id=>BY[id]);
}
const CHARACTER_NAMES={
 hero_classic:'Siêu nhân nguyên bản',outfit_vest:'Siêu nhân Chủ Tịch',
 outfit_ninja:'Siêu nhân Ninja',outfit_armor:'Siêu nhân Chiến Binh',
 outfit_royal:'Siêu nhân Hoàng Gia',hero_sun:'Siêu nhân VIP',
 hero_thunder:'Siêu nhân Sấm Sét',hero_king:'Siêu nhân Đại Gia',
 hero_natra:'Bé Na Tra Lửa Đỏ',hero_monkey:'Hầu Vương Thiên Cung',hero_dragon_knight:'Tiểu Long Tướng',
 hero_thunder_god:'Chiến Thần Lôi Điện',hero_block:'Khối Vuông Phi Hành',
 hero_gold_boss:'Đại Gia Vest Vàng',hero_traffic:'Siêu Nhân Giao Thông',
 hero_mecha:'Mecha Hộ Vệ',hero_titan:'Robot Titan Cánh Thép',hero_robot_pilot:'Phi Công Người Máy'
};
function shopName(item){return CHARACTER_NAMES[item.id]||item.name}
function shopDescription(item){return CHARACTER_NAMES[item.id]?'Nhân vật 3D nguyên bộ, không ghép phụ kiện':item.desc}
function currentChar(eq){return eq.outfit&&eq.outfit!=='outfit_none'?eq.outfit:(eq.character||'hero_classic')}
function cosmeticIsActive(item,eq){return item.slot==='pet'?eq.pet===item.id:currentChar(eq)===item.id}
function previewEquipment(eq,item){const next={...eq};if(!item)return next;
 if(item.slot==='pet')next.pet=item.id;
 else if(item.slot==='outfit'){next.outfit=item.id;next.character='hero_classic'}
 else {next.character=item.id;next.outfit='outfit_none'}return next}

const DEFAULT=Object.fromEntries(GEAR.filter(x=>x.price===0).map(x=>[x.slot,x.id]));
const guest=load(KEY,{nick:'Chủ Tịch',best:0,totalEarned:0,ranking:[],items:[],equip:{},avatar:null,sound:true});
for(const [k,v] of Object.entries({nick:'Chủ Tịch',best:0,totalEarned:0,ranking:[],items:[],equip:{},avatar:null,sound:true})){if(guest[k]===undefined)guest[k]=v}
// Keep the existing player's legacy score, nickname and selfie after upgrading from v2.
const previous=load('sieu-nhan-ne-nhau-v1-profile',{});
if(!localStorage.getItem(KEY)){
 guest.nick=String(previous.nick||guest.nick).slice(0,16);
 guest.avatar=previous.avatar||null;
 const priorRanks=load('sieu-nhan-ne-nhau-v1-ranking',[]);
 if(Array.isArray(priorRanks))guest.ranking=priorRanks.filter(r=>r&&typeof r.score==='number').slice(0,15);
}
guest.best=Math.max(0,Number(guest.best)||0,Number(load('sieu-nhan-ne-nhau-v1-best',0))||0);
let guestGold=load(GKEY,0);if(!Number.isFinite(guestGold)||guestGold<0)guestGold=0;
// V2 had no shop, so historical wallet equals historical gold earned.
if(!localStorage.getItem(KEY))guest.totalEarned=Math.max(guest.totalEarned,guestGold);
let cloud=null,me=null,account=null,owned=new Set(),pendingRun=null,onlineRequest=0,soundOn=guest.sound;
const cloudSettings=window.NN_CLOUD||{};const cloudConfigured=!!(cloudSettings.url&&cloudSettings.anonKey&&window.supabase&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cloudSettings.url));
let H=780,dpr=1,phase='menu',previousPhase='menu',page='shop',shopTab='character',rankTab='score',previewItem=null;
let time=0,elapsed=0,last=0,scroll=0,spawnGap=0,score=0,coins=0,passed=0,shield=0,slow=0,immortal=0,double=0,magnet=0,shake=0,flashing=0,items=[],obstacles=[];
let player={x:98,y:350,vy:0,r:22,rot:0},avatarImg=null,audio=null,toastId=0,busy=false;
const sprite={};for(const file of ['hero','beer-stall','grill-stall','wife']){const im=new Image();im.src='assets/'+file+'.png';sprite[file]=im}
const powers={slow:['⚽',4,'BAY CHẬM'],immortal:['🏸',3,'BẤT TỬ'],double:['🏋️',5,'×2 ĐIỂM'],shield:['🥤',0,'KHIÊN'],magnet:['🧲',6,'HÚT VÀNG']};
const wifeGood=['VÀNG ĐỦ RỒI, LẦN NÀY EM THA!','NÉ QUÁN TỐT ĐẤY, NHỚ VỀ SỚM!','TIỀN NỘP ĐỦ, TỘI TẠM THA!','ANH GIỎI... NHƯNG MAI RỬA BÁT!','THÔI ĐƯỢC, TỐI NAY KHÔNG CẦN NGỦ SOFA!'];
const wifeBad=['NHẬU KHÔNG THẤY MỆT, RỬA BÁT LẠI KÊU!','LƯƠNG ĐÂU? HAY BIẾN THÀNH BIA RỒI?','SIÊU NHÂN GÌ MÀ KHÔNG NÉ NỔI LỜI RỦ!','ANH VỀ ĐÚNG LÚC EM ĐANG THỬ CHỔI MỚI!','ĐỪNG GỌI EM LÀ NÓC NHÀ, HÃY GỌI LÀ BẦU TRỜI!','MANG ÍT VÀNG VỀ THÌ TỰ GIÁC TRỰC BẾP!'];
function html(tag,cl,text){const x=document.createElement(tag);if(cl)x.className=cl;if(text!==undefined)x.textContent=text;return x}
function btn(text,fn,cl='alt'){const x=html('button',cl,text);x.type='button';x.onclick=fn;return x}
function notify(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toastId);toastId=setTimeout(()=>t.classList.add('hidden'),2400)}
function persist(){save(KEY,guest)}
function isOnline(){return !!(me&&account&&cloud)}
function wallet(){return isOnline()?account.gold_balance:guestGold}
function updateGoldUi(){const g=wallet();$('wallet').textContent=money(g);$('panelGold').textContent='🪙 '+money(g);$('state').textContent=isOnline()?'ONLINE · LƯU MÂY':'KHÁCH · LƯU MÁY';$('panelUser').textContent=isOnline()?'🟢 '+account.nickname:'⚪ Khách · chưa đồng bộ'}
function getOwned(item){return item.price===0||(isOnline()?owned.has(item.id):guest.items.includes(item.id))}
function equipped(){const src=isOnline()?account.equipped:guest.equip;const eq={...DEFAULT,...src};for(const [slot,id] of Object.entries(eq))if(!BY[id]||BY[id].slot!==slot||!getOwned(BY[id]))eq[slot]=DEFAULT[slot];return eq}
window.NNGameEquipment=equipped;
function setGuestGold(n){guestGold=Math.max(0,Math.floor(n));save(GKEY,guestGold);updateGoldUi()}
function setStage(p){phase=p;for(const id of ['menu','pauseScreen','over','panel'])$(id).classList.toggle('hidden',id!==(p==='pause'?'pauseScreen':p));$('hud').classList.toggle('hidden',p!=='play');}
function openPanel(kind){previousPhase=phase;page=kind||'shop';previewItem=null;setStage('panel');renderPanel()}
function closePanel(){setStage(previousPhase==='over'?'over':'menu');updateGoldUi()}
function setAvatar(uri){guest.avatar=uri||null;persist();const preview=$('face');preview.replaceChildren();if(uri){const im=new Image();im.onload=()=>{avatarImg=im};im.src=uri;const thumb=html('img');thumb.src=uri;thumb.alt='Ảnh người chơi';preview.append(thumb)}else{avatarImg=null;preview.textContent='😎'}}
function takePhoto(input){const file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>15e6){notify('Chọn ảnh dưới 15 MB nhé');return}const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const c=canvas.getContext('2d');const d=Math.min(im.width,im.height);c.drawImage(im,(im.width-d)/2,(im.height-d)/2,d,d,0,0,160,160);setAvatar(canvas.toDataURL('image/jpeg',.77));URL.revokeObjectURL(url);notify('Đã gắn mặt siêu nhân!')};im.onerror=()=>{URL.revokeObjectURL(url);notify('Không đọc được ảnh')};im.src=url;input.value=''}
function name(){return ($('nickname').value.trim().slice(0,16)||'Siêu nhân')}
function updateNickname(){guest.nick=name();persist();if(isOnline()&&name()!==account.nickname){cloud.rpc('set_player_name',{p_nickname:name()}).then(({data,error})=>{if(!error){account.nickname=data;updateGoldUi()}else notify('Chưa lưu biệt danh online: '+error.message)})}}
function renderPanel(){const title=page==='shop'?'🛍️ NHÂN VẬT & PET':page==='rank'?'🏆 BẢNG VÀNG':'👤 TÀI KHOẢN';$('panelTitle').textContent=title;updateGoldUi();for(const b of document.querySelectorAll('[data-page]'))b.classList.toggle('active',b.dataset.page===page);const content=$('panelContent');content.replaceChildren();if(page==='shop')drawShop(content);else if(page==='rank')drawRanks(content);else drawAccount(content)}
function drawShop(root){
 root.append(html('p','intro','Chỉ bán nhân vật 3D nguyên bộ và thú cưng bay theo. Không còn mũ, kính, tóc, trang sức hay áo quần rời.'));
 if(!isOnline())root.append(html('p','notice','⚠ Chơi khách: vàng và vật phẩm lưu trên máy này. Đăng nhập sử dụng ví online riêng.'));
 const tabs=html('div','tabs');for(const [slot,label] of GROUPS){const b=btn(label,()=>{shopTab=slot;previewItem=null;renderPanel()},'tab');b.classList.toggle('active',slot===shopTab);tabs.append(b)}root.append(tabs);
 const eq=equipped(),pr=previewEquipment(eq,BY[previewItem]);
 const pv=html('div','preview');const cv=html('canvas','nn-cp-preview');cv.width=720;cv.height=420;cv.setAttribute('aria-label','Nhân vật 3D và pet đang thử');pv.append(cv);root.append(pv);
 root.dataset.previewItem=previewItem||'';
 const selection=previewItem?BY[previewItem]:null;
 const worn=shopName(BY[currentChar(pr)]||BY.hero_classic);const pet=pr.pet&&pr.pet!=='pet_none'?BY[pr.pet]?.name:'';
 root.append(html('p','previewtag',(selection?'✨ ĐANG THỬ: ':'✨ ĐANG DÙNG: ')+(selection?shopName(selection):worn)+(selection?'':' · '+(pet||'Không pet'))));
 root.append(html('p','nn-cp-subtitle','Nhân vật là ảnh 3D nguyên bộ • Pet bay phía sau • Mua một lần dùng mãi'));
 const cards=html('div','productgrid');const listing=shopTab==='character'?characterItems():PET_IDS.map(id=>BY[id]);
 for(const item of listing){
  const wornNow=cosmeticIsActive(item,eq),card=html('article','product nn-cp-card'+(wornNow?' nn-cp-worn':''));
  const tile=html('div','productemoji nn-cp-art'),thumb=html('canvas','nn-cp-tile');thumb.width=360;thumb.height=240;thumb.dataset.itemId=item.id;
  tile.append(thumb);card.append(tile);
  const info=html('div');info.append(html('div','productname',shopName(item)),html('div','productdesc',shopDescription(item)),html('div','price',item.price?money(item.price)+' 🪙':'MIỄN PHÍ'));
  card.append(info);
  const act=html('div','productactions');act.append(btn('👁 THỬ',()=>{previewItem=item.id;renderPanel()},'shopaction'));
  const action=btn(wornNow?'✓ ĐANG DÙNG':getOwned(item)?'MẶC':'MUA',()=>getOwned(item)?equipItem(item):buyItem(item),'shopaction goldbtn');action.disabled=wornNow;
  act.append(action);card.append(act);cards.append(card);
 }
 root.append(cards)
}
// One character slot at a time. Keep old ownership data, including hidden accessories.
async function applyCosmetic(item){
 const ids=item.slot==='pet'?[item.id]:item.slot==='outfit'?['hero_classic',item.id]:['outfit_none',item.id];
 if(isOnline()){
  for(const id of ids){const {data,error}=await cloud.rpc('equip_cosmetic',{p_item_id:id});if(error)throw error;account.equipped=data}
 }else{
  if(item.slot==='pet')guest.equip.pet=item.id;
  else if(item.slot==='outfit'){guest.equip.character='hero_classic';guest.equip.outfit=item.id}
  else {guest.equip.outfit='outfit_none';guest.equip.character=item.id}
  persist();
 }
}
async function buyItem(item){
 if(busy)return;if(wallet()<item.price){notify('Thiếu '+money(item.price-wallet())+' vàng!');return}
 busy=true;let purchased=false;
 try{
  if(isOnline()){
   const {data,error}=await cloud.rpc('buy_cosmetic',{p_item_id:item.id});if(error)throw error;
   account.gold_balance=data[0].gold_balance;owned.add(item.id);
  }else{
   if(!guest.items.includes(item.id))guest.items.push(item.id);
   persist();setGuestGold(guestGold-item.price)
  }
  purchased=true;
  await applyCosmetic(item);previewItem=null;notify('✅ Đã mua và trang bị '+item.name);renderPanel();
 }catch(e){notify(purchased?'Đã mua nhưng chưa mặc được: '+e.message:'Không mua được: '+e.message);renderPanel()}
 finally{busy=false}
}
async function equipItem(item){if(busy||!getOwned(item))return;busy=true;
 try{await applyCosmetic(item);previewItem=null;notify('✅ Đã chọn '+item.name);renderPanel()}
 catch(e){notify('Lỗi trang bị: '+e.message)}finally{busy=false}
}
async function drawRanks(root){root.append(html('p','intro','🏆 TOP điểm: điểm cao nhất trong một lượt. 💰 Đại gia: tổng vàng đã nhặt từ trước tới nay (không trừ khi mua đồ).'));
const tabs=html('div','tabs');for(const [type,t] of [['score','🏆 TOP ĐIỂM'],['gold','💰 TOP ĐẠI GIA']]){const b=btn(t,()=>{rankTab=type;renderPanel()},'tab');b.classList.toggle('active',type===rankTab);tabs.append(b)}root.append(tabs);const box=html('div');root.append(box);
if(!cloudConfigured||!cloud){box.append(html('p','notice','Chưa kết nối máy chủ nên TOP toàn game chưa bật. Các mục dưới là kết quả lưu trên thiết bị.'));if(rankTab==='score'){for(const [i,row] of guest.ranking.slice(0,10).entries())rankLine(box,i,row.nick,row.score,' điểm')}else rankLine(box,0,guest.nick,guest.totalEarned,' 🪙');return}
box.append(html('p','muted','Đang tải TOP toàn game...'));const seq=++onlineRequest,kind=rankTab;
try{const {data,error}=await cloud.rpc('get_leaderboard',{p_kind:kind});if(error)throw error;if(phase!=='panel'||page!=='rank'||seq!==onlineRequest||rankTab!==kind)return;box.replaceChildren();if(!data?.length){box.append(html('p','muted','Chưa có người chơi ghi danh. Bay một ván để đứng TOP!'));return}for(const [i,row] of data.entries())rankLine(box,i,row.nickname,kind==='score'?row.best_score:row.gold_earned,kind==='score'?' điểm':' 🪙')}catch(err){box.replaceChildren();box.append(html('p','notice','Bảng TOP đang gián đoạn: '+err.message))}}
function rankLine(root,i,nick,value,suffix){const row=html('div','rankrow');row.append(html('strong','',i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)),html('span','',nick||'Siêu nhân'),html('b','',money(value)+suffix));root.append(row)}
function drawAccount(root){if(!cloudConfigured){root.append(html('p','notice','Tài khoản online chưa kích hoạt. Chủ game cần tạo dự án Supabase, chạy supabase-setup.sql và điền URL + publishable key vào cloud-config.js. Shop vẫn chơi miễn phí trên máy.'));return}
if(isOnline()){const c=html('div','accountcard');c.append(html('h3','', '✅ '+account.nickname),html('p','', '🪙 Ví: '+money(account.gold_balance)),html('p','', '💰 Tổng vàng kiếm: '+money(account.gold_earned)),html('p','', '🏆 Kỷ lục: '+money(account.best_score)));root.append(c,html('p','muted','Tài khoản đồng bộ vàng, điểm, đồ và pet. Ảnh selfie riêng chỉ lưu trên thiết bị này.'),btn('ĐĂNG XUẤT',logout));return}
root.append(html('h3','', 'Đăng ký để lưu vàng & vật phẩm lâu dài'),html('p','intro','Dùng email và mật khẩu 8 ký tự trở lên. Sau khi đăng ký có thể cần xác minh email.'));
const form=html('form','authform');form.onsubmit=e=>e.preventDefault();const email=html('input');email.id='authEmail';email.type='email';email.placeholder='Email';email.autocomplete='email';const pass=html('input');pass.id='authPassword';pass.type='password';pass.placeholder='Mật khẩu (8 ký tự trở lên)';pass.autocomplete='current-password';form.append(email,pass);root.append(form);const acts=html('div','authrow');acts.append(btn('ĐĂNG NHẬP',()=>authenticate('login')),btn('ĐĂNG KÝ',()=>authenticate('signup')));root.append(acts,btn('Quên mật khẩu? Gửi email đặt lại',forgot),html('p','muted','Đăng ký tài khoản tạo ví online mới từ 0 vàng. Vàng khách không chuyển lên online để tránh gian lận.'))}
async function authenticate(action){if(busy)return;const email=$('authEmail')?.value.trim(),password=$('authPassword')?.value;if(!email||!email.includes('@')||!password||password.length<8){notify('Nhập email và mật khẩu ít nhất 8 ký tự');return}busy=true;try{const result=action==='login'?await cloud.auth.signInWithPassword({email,password}):await cloud.auth.signUp({email,password,options:{data:{nickname:name()}}});if(result.error)throw result.error;if(result.data.session){await loadAccount(result.data.user);notify('✅ Đăng nhập thành công')}else notify('Đã đăng ký! Kiểm tra email xác minh rồi đăng nhập.') }catch(err){notify('Lỗi: '+err.message)}finally{busy=false;renderPanel()}}
async function forgot(){const email=$('authEmail')?.value.trim();if(!email?.includes('@')){notify('Nhập email để đặt lại mật khẩu');return}try{const {error}=await cloud.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;notify('Đã gửi email đặt lại mật khẩu')}catch(err){notify(err.message)}}
async function logout(){if(!cloud)return;busy=true;try{await cloud.auth.signOut();me=null;account=null;owned=new Set();notify('Đã đăng xuất, quay về khách')}catch(e){notify('Không thể đăng xuất: '+e.message)}finally{busy=false;renderPanel();updateGoldUi()}}
async function loadAccount(u){if(!u){me=null;account=null;owned=new Set();updateGoldUi();return}try{const [p,i]=await Promise.all([cloud.from('players').select('id,nickname,gold_balance,gold_earned,best_score,equipped').eq('id',u.id).single(),cloud.from('owned_items').select('item_id').eq('player_id',u.id)]);if(p.error)throw p.error;if(i.error)throw i.error;me=u;account=p.data;owned=new Set((i.data||[]).map(x=>x.item_id));$('nickname').value=account.nickname;updateGoldUi();if(phase==='panel')renderPanel();await syncPending()}catch(e){me=null;account=null;notify('Chưa tải được ví online: '+e.message)}}
async function startCloud(){if(!cloudConfigured){updateGoldUi();return}try{cloud=window.supabase.createClient(cloudSettings.url.replace(/\/$/,''),cloudSettings.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data,error}=await cloud.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;if(data?.user)await loadAccount(data.user);cloud.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')Promise.resolve().then(()=>{if(event==='SIGNED_OUT'){me=null;account=null;owned=new Set();updateGoldUi()}else if(session?.user?.id!==me?.id)loadAccount(session.user)})})}catch(e){notify('Không kết nối được server: '+e.message)}}
function queueKey(){return 'nn3-queue-'+me?.id}
function pending(){const q=load(queueKey(),[]);return Array.isArray(q)?q:[]}
async function syncPending(){if(!isOnline()||busy)return;const q=pending();for(const run of q){if(!isOnline())break;const {data,error}=await cloud.rpc('finish_run',{p_run_id:run.id,p_score:run.score,p_gold:run.coins,p_passed:run.passed});if(error){$('syncStatus').textContent='Chưa đồng bộ: '+error.message;return}save(queueKey(),pending().filter(x=>x.id!==run.id));if(data?.[0]){account.gold_balance=data[0].gold_balance;account.gold_earned=data[0].gold_earned;account.best_score=data[0].best_score;updateGoldUi()}}if(!pending().length&&phase==='over')$('syncStatus').textContent='✅ Vàng và kỷ lục đã đồng bộ lên tài khoản!'}
async function beginOnlineRun(){pendingRun=null;if(!isOnline())return;const id=me.id;pendingRun=cloud.rpc('begin_run').then(({data,error})=>{if(error)throw error;return {id:data,user:id}}).catch(e=>{notify('Mất kết nối: ván này chưa ghi TOP online');return null})}
async function endOnlineRun(result){if(!isOnline())return;const id=me.id,run=await pendingRun;if(!run||run.user!==id){$('syncStatus').textContent='⚠ Ván này chưa được ghi nhận online';return}const q=pending();if(!q.some(r=>r.id===run.id))q.push({id:run.id,...result});save(queueKey(),q.slice(-30));$('syncStatus').textContent='⏳ Đang lưu vàng online...';await syncPending()}
// ---- Arcade engine ----
function resize(){const r=canvas.getBoundingClientRect();H=clamp(W*r.height/Math.max(1,r.width),580,950);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h)}
function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function round(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function emoji(x,y,t,size=28){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=size+'px system-ui,Apple Color Emoji,Segoe UI Emoji';ctx.fillText(t,x,y)}
function label(x,y,t,size=14,color='#fff',stroke='#18244d'){ctx.font='1000 '+size+'px system-ui,Segoe UI,Arial';ctx.textBaseline='middle';ctx.textAlign='center';ctx.lineJoin='round';ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.strokeText(t,x,y);ctx.fillStyle=color;ctx.fillText(t,x,y)}
function sfx(freq=450,duration=.1){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}catch{}}
function spriteReady(file){return sprite[file]?.complete&&sprite[file].naturalWidth>0}
function paint(file,x,y,w,h){if(!spriteReady(file))return false;ctx.drawImage(sprite[file],x,y,w,h);return true}
function background(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#10174a');g.addColorStop(.5,'#435cb8');g.addColorStop(.72,'#e88b9e');g.addColorStop(1,'#ffd58e');rect(0,0,W,H,g);for(let i=5;i>0;i--)circle(315,124,23+i*7,`rgba(255,213,130,${.018+i*.006})`);circle(315,124,25,'#ffe6a2');
 for(let i=0;i<10;i++){const x=((i*101-scroll*.14)%570+570)%570-90,y=95+(i*53)%230;for(const [dx,dy,r] of [[0,10,18],[18,0,27],[43,8,19]])circle(x+dx,y+dy,r,'#f6e7ff29')}
 const floor=H*.71;rect(0,floor,W,H-floor,'#284c86');for(let i=0;i<20;i++){const x=((i*55-scroll*.23)%1180+1180)%1180-100,h=55+(i*31)%102;rect(x,floor-h,42,h,i%2?'#3d5689':'#344875');for(let n=0;n<3;n++)for(let j=0;j<2;j++)if((n+j+i)%3)rect(x+6+j*18,floor-h+10+n*19,5,7,'#fff2a56b')}
 const water=H*.77;rect(0,water,W,H-water,'#1c457a');for(let i=0;i<15;i++){const x=((i*79-scroll*.4)%650+650)%650;rect(x,water+16+(i%3)*20,31,2,'#a7daf36c')}
 rect(0,H-79,W,79,'#2b3661');rect(0,H-82,W,9,'#e1b59c');for(let i=-1;i<10;i++){const x=((i*70-scroll)%700+700)%700-70;rect(x+13,H-92,8,59,'#c5b9a4');rect(x,H-42,69,7,'#99adaf')}
 for(let i=0;i<15;i++){const x=(i*97+36)%W,y=(i*59+19)%310+30;circle(x,y,1.5,'#ffefa288')}
}
function drawnStall(x,y,w,h,kind,title){const file=kind==='grill'?'grill-stall':'beer-stall';if(!paint(file,x-10,y-7,w+20,h+16)){
 round(x,y,w,h,12,'#683752','#ffae80');round(x+8,y+36,w-16,h-46,8,'#2c2d59');round(x-4,y,w+8,43,6,'#b02b59','#ffc16a');emoji(x+w*.35,y+h*.60,'🍺',26);emoji(x+w*.65,y+h*.60,'🍖',23)}
 label(x+w/2,y+27,title,Math.min(15,165/title.length),'#fff0a2','#72213b')}
function drawObstacle(ob){if(ob.type==='split'){
  drawnStall(ob.x,ob.mid,ob.w,ob.h,'beer',ob.name);
  if(!ob.got)powerIcon(ob.x+ob.w/2,ob.lane==='top'?(105+ob.mid)/2:(ob.mid+ob.h+H-92)/2,ob.power);
 }else{
  drawnStall(ob.x,ob.top-133,ob.w,137,ob.kind,ob.name);
  drawnStall(ob.x,ob.bottom,ob.w,141,ob.kind2,ob.name2);
  if(ob.coin&&!ob.coin.got)coinIcon(ob.coin.x,ob.coin.y)
 }}
function powerIcon(x,y,type){ctx.save();ctx.shadowColor='#ffde74';ctx.shadowBlur=14;circle(x,y,23,'#19345e');circle(x,y,21,'#f5ba32');emoji(x,y,powers[type][0],29);ctx.restore()}
function coinIcon(x,y){ctx.save();ctx.shadowColor='#ffca3b';ctx.shadowBlur=14;circle(x,y,13+Math.sin(time*8)*1.2,'#ffd052');label(x,y,'★',15,'#fff5b5','#a86f2b');ctx.restore()}
function drawHero(y){
 const x=player.x,eq=equipped();ctx.save();ctx.translate(x,y);ctx.rotate(player.rot*.53);
 const rendered=window.NNShop3D?.drawGameHero?.(ctx,-96,-63,184,114,eq,time)||false;
 if(!rendered){
  if(!paint('hero',-90,-62+Math.sin(time*16)*2,160,113))emoji(0,0,'🦸',87);
 }
 // Power states remain visible on HUD; no circles drawn around the character.
 ctx.restore();if(!rendered)drawPet(x,y,eq.pet);
}
function drawPet(x,y,id){if(id==='pet_none')return;
 const e=BY[id]?.emoji||'🐾',px=x-78+Math.sin(time*3.7)*8,py=y+32+Math.sin(time*7)*9;
 ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(time*5)*.08);emoji(0,0,e,34);ctx.restore();
}
function draw(){ctx.save();if(shake>0)ctx.translate(random(-shake,shake),random(-shake,shake));background();for(const ob of obstacles)drawObstacle(ob);
 if(phase==='play'||phase==='pause')drawHero(player.y);else if(phase==='menu')drawHero(H*.50+Math.sin(time*2)*9);else if(phase==='over')drawHero(H*.52);
 if(phase==='play'&&elapsed<3)label(W/2,168,'CHẠM ĐỂ BAY ↑',18,'#ffeb9b');
 if(phase==='play'&&(slow>elapsed||immortal>elapsed||double>elapsed||magnet>elapsed||shield)){
 let effect=immortal>elapsed?'🏸 BẤT TỬ':slow>elapsed?'⚽ BAY CHẬM':double>elapsed?'🏋️ NHÂN ĐÔI':magnet>elapsed?'🧲 HÚT VÀNG':'🥤 KHIÊN';round(114,112,172,30,10,'#142d64aa','#ffe187');label(200,127,effect,12,'#ffe89d')}
 if(flashing>0)rect(0,0,W,H,`rgba(255,255,255,${Math.min(.4,flashing)})`);ctx.restore()}
function spawn(){const list=['BIA HƠI','QUÁN NHẬU','LẨU NƯỚNG','ỐC ĐÊM','TẤT NIÊN','BIA TƯƠI'];const x=W+55;
 if(passed>2&&Math.random()<.24){const h=clamp(H*.20,118,163),mid=clamp(H*.47-h*.5,195,H*.52),p=one(Object.keys(powers));obstacles.push({type:'split',x,w:169,mid,h,lane:Math.random()<.5?'top':'bottom',power:p,got:false,name:one(list),done:false})}
 else{const gap=clamp(H*.33,210,260),top=random(H*.18+8,Math.max(H*.18+9,H-110-gap-30)),bottom=top+gap;obstacles.push({type:'normal',x,w:145,top,bottom,kind:Math.random()<.5?'beer':'grill',kind2:Math.random()<.5?'beer':'grill',name:one(list),name2:one(list),coin:Math.random()<.8?{x:x+72,y:(top+bottom)*.5,value:Math.floor(random(8,17)),got:false}:null,done:false})}}
function hit(cx,cy,r,x,y,w,h){const px=clamp(cx,x,x+w),py=clamp(cy,y,y+h);return (cx-px)**2+(cy-py)**2<r*r}
function collision(ob){const x=ob.x,r=player.r*.8,y=player.y;if(ob.type==='split')return hit(player.x,y,r,x,ob.mid,ob.w,ob.h);return hit(player.x,y,r,x,-100,ob.w,ob.top+105)||hit(player.x,y,r,x,ob.bottom,ob.w,H-ob.bottom+50)}
function collect(type){const sec=powers[type][1];if(type==='slow')slow=elapsed+sec;else if(type==='immortal'){immortal=elapsed+sec;player.vy=0}else if(type==='double')double=elapsed+sec;else if(type==='magnet')magnet=elapsed+sec;else if(type==='shield')shield=1;sfx(680,.16);notify(powers[type][0]+' '+powers[type][2])}
function updateHud(){ $('score').textContent=money(score);$('coins').textContent=money(coins);$('best').textContent=money(Math.max(score,guest.best,account?.best_score||0));$('power').textContent='TỐC ĐỘ ×'+(1+Math.min(elapsed/44,1.9)).toFixed(1)}
function newGame(){updateNickname();time=0;elapsed=0;scroll=0;spawnGap=100;score=0;coins=0;passed=0;slow=0;immortal=0;double=0;magnet=0;shield=0;shake=0;flashing=0;obstacles=[];player={x:98,y:H*.46,vy:0,r:22,rot:0};$('syncStatus').textContent='';setStage('play');updateHud();beginOnlineRun();sfx(490,.12)}
function flap(){if(phase!=='play'||immortal>elapsed)return;player.vy=-330;sfx(350,.065)}
function gameOver(){if(phase!=='play')return;setStage('over');flashing=.55;shake=9;sfx(175,.34);
const record=score>guest.best;guest.best=Math.max(guest.best,score);guest.ranking=Array.isArray(guest.ranking)?guest.ranking:[];if(score>0)guest.ranking=[...guest.ranking,{nick:name(),score}].sort((a,b)=>b.score-a.score).slice(0,15);
if(!isOnline()){guest.totalEarned+=coins;setGuestGold(guestGold+coins)}persist();$('endScore').textContent=money(score);$('endBest').textContent=money(Math.max(guest.best,account?.best_score||0));$('endCoins').textContent=money(coins);
const forgiven=passed>0&&coins>=passed,shortage=Math.max(0,passed-coins);$('wifeLine').textContent=one(forgiven?wifeGood:wifeBad);$('wifeFace').textContent=forgiven?'😏':'🧹😡';$('verdict').classList.toggle('bad',!forgiven);$('verdict').textContent=forgiven?`😏 Né ${passed} quán, nhặt ${coins} vàng. Vợ lườm rồi tha!${record?' 🏆 KỶ LỤC MỚI!':''}`:`😱 Né ${passed} quán, nhặt ${coins} vàng. ${shortage?'Thiếu '+shortage+' vàng. ':''}Đêm nay ngủ sofa!${record?' 🏆 KỶ LỤC MỚI!':''}`;
if(isOnline())endOnlineRun({score,coins,passed});else $('syncStatus').textContent='🪙 Vàng đã lưu trên thiết bị; đăng nhập để tích lũy online (ví riêng).';updateHud()}
function advance(dt){time+=dt;scroll+=dt*24;if(phase!=='play')return;elapsed+=dt;const speed=150*(1+Math.min(elapsed/44,1.9))*(slow>elapsed?.52:1);scroll+=speed*dt;spawnGap+=speed*dt;
if(spawnGap>310){spawnGap=0;spawn()}const safe=immortal>elapsed;
if(safe){player.vy=0;player.y+=(H*.47-player.y)*Math.min(1,dt*5);player.rot=-.05}else{player.vy=clamp(player.vy+800*dt,-400,440);player.y+=player.vy*dt;player.rot=clamp(player.vy/860,-.45,.48);if(player.y<110||player.y>H-105){gameOver();return}}
for(let i=obstacles.length-1;i>=0;i--){const ob=obstacles[i];ob.x-=speed*dt;if(ob.coin)ob.coin.x-=speed*dt;if(ob.x+ob.w<-50){obstacles.splice(i,1);continue}
if(!ob.done&&ob.x+ob.w<player.x-player.r){ob.done=true;passed++;score+=double>elapsed?2:1;if(passed%10===0)score+=5;sfx(520,.06);updateHud()}
if(ob.coin&&!ob.coin.got){const c=ob.coin;if(Math.hypot(player.x-c.x,player.y-c.y)<31||(magnet>elapsed&&Math.abs(player.x-c.x)<122)){c.got=true;coins+=c.value;updateHud();sfx(950,.08)}}
if(ob.type==='split'&&!ob.got){const pos=ob.lane==='top'?(105+ob.mid)/2:(ob.mid+ob.h+H-92)/2;if(Math.hypot(player.x-(ob.x+ob.w/2),player.y-pos)<41){ob.got=true;collect(ob.power)}}
// A picked-up invincibility item is effective in this same frame.
const touching=collision(ob),protectedNow=immortal>elapsed;
if(touching&&protectedNow)ob.immortalPass=true;
if(!touching)ob.immortalPass=false;
if(touching&&!protectedNow&&!ob.immortalPass){
 if(shield){shield=0;immortal=elapsed+1.3;ob.immortalPass=true;flashing=.4;sfx(270,.15)}
 else{gameOver();return}
}}
shake=Math.max(0,shake-dt*30);flashing=Math.max(0,flashing-dt*2.5)}
function frame(stamp){const dt=Math.min(.034,Math.max(.002,(stamp-last)/1000||.016));last=stamp;advance(dt);draw();requestAnimationFrame(frame)}
async function share(){const msg=`🦸 SIÊU NHÂN NÉ NHẬU! Tao vừa né ${passed} quán, được ${score} điểm, nhặt ${coins} vàng! Mày có vượt được không?\n${location.href}`;if(navigator.share){try{await navigator.share({title:'Siêu Nhân Né Nhậu',text:msg})}catch{}}else if(navigator.clipboard){try{await navigator.clipboard.writeText(msg);notify('Đã sao chép lời thách đấu!')}catch{notify('Chụp màn hình để khoe bạn bè!')}}}
function bind(){resize();$('nickname').value=guest.nick;setAvatar(guest.avatar);updateGoldUi();$('play').onclick=newGame;$('replay').onclick=newGame;$('pause').onclick=()=>{if(phase==='play')setStage('pause')};$('resume').onclick=()=>{setStage('play');last=performance.now()};for(const b of document.querySelectorAll('[data-home]'))b.onclick=()=>setStage('menu');for(const b of document.querySelectorAll('[data-open]'))b.onclick=()=>{if(b.dataset.open==='rank')rankTab=b.closest('#over')?'gold':'score';openPanel(b.dataset.open)};
$('closePanel').onclick=closePanel;for(const b of document.querySelectorAll('[data-page]'))b.onclick=()=>{page=b.dataset.page;previewItem=null;renderPanel()};$('cameraBtn').onclick=()=>$('cameraInput').click();$('galleryBtn').onclick=()=>$('photoInput').click();$('cameraInput').onchange=e=>takePhoto(e.target);$('photoInput').onchange=e=>takePhoto(e.target);$('nickname').onchange=updateNickname;$('sound').textContent=soundOn?'🔊 ÂM THANH':'🔇 TẮT TIẾNG';$('sound').onclick=()=>{soundOn=!soundOn;guest.sound=soundOn;persist();$('sound').textContent=soundOn?'🔊 ÂM THANH':'🔇 TẮT TIẾNG';sfx(700)};$('share').onclick=share;
canvas.addEventListener('pointerdown',e=>{if(phase==='play'){e.preventDefault();flap()}});window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){if(e.repeat)return;e.preventDefault();if(phase==='play')flap();else if(phase==='menu')newGame()}else if(e.code==='Escape'&&phase==='play')setStage('pause')});document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='play')setStage('pause')});window.addEventListener('resize',resize);
setStage('menu');requestAnimationFrame(frame);startCloud();if(location.protocol==='https:'&&'serviceWorker' in navigator)navigator.serviceWorker.register('./sw-v3.js').catch(()=>{})}
bind();
})();
