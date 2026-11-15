const CACHE='nn-v16-shop-16-hero-16-pet-chairman-20261115';
const FILES=['./','./index.html','./game-v3.js','./v3.css','./cloud-config.js','./manifest.webmanifest','./icon.png','./wife-scene.webp','./assets/hero.png','./assets/beer-stall.png','./assets/grill-stall.png','./shop-3d.js','./shop-3d-atlas.png','./shop-parts-v11.png','./shop-base-clean-v11.png','./shop-heroes-v13.webp','./shop-pets-v13.webp','./chu-tich-bay-v15.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async cache=>{
 await Promise.allSettled(FILES.map(async path=>{try{const resp=await fetch(path,{cache:'reload'});if(resp.ok)await cache.put(path,resp)}catch(_){}}));
 await self.skipWaiting();
}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nn-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return resp}).catch(()=>caches.match(e.request)));
});
