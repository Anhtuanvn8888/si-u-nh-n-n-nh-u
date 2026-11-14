const CACHE='ne-nhau-v2-2-cartoon-1';
const FILES=['./','./index.html','./style.css','./game.js','./manifest.webmanifest','./icon.png','./icon-512.png','./wife-scene.webp','./assets/hero.png','./assets/beer-stall.png','./assets/grill-stall.png','./assets/ball.png','./assets/racket.png','./assets/wife.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return resp}).catch(()=>caches.match(e.request)))});
