/* Společný offline režim pro Šájinu akademii. */
const CACHE_NAME='saja-akademie-android-hub-v3';
const FILES=['./','./index.html','./matematika/','./matematika/index.html','./cestina/','./cestina/index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./cestina/icon-192.png','./cestina/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
const cache=await caches.open(CACHE_NAME);
await Promise.all(FILES.map(async path=>{
 const r=await fetch(new Request(path,{cache:'reload'}));
 if(!r.ok)throw new Error('Nepodařilo se stáhnout '+path);
 await cache.put(path,r);
}));
})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
const names=await caches.keys();
await Promise.all(names.filter(n=>n.startsWith('saja-akademie-android-')||n.startsWith('saja-akademie-android-hub-')).filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)));
await self.clients.claim();
})())});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==location.origin)return;
 event.respondWith((async()=>{
  if(event.request.mode==='navigate'){
    try{const res=await fetch(event.request);if(res.ok){const c=await caches.open(CACHE_NAME);c.put(event.request,res.clone()).catch(()=>{})}return res}
    catch(e){return await caches.match(event.request,{ignoreSearch:true})||await caches.match('./index.html')}
  }
  const cached=await caches.match(event.request,{ignoreSearch:true});
  if(cached)return cached;
  return fetch(event.request);
 })());
});
