/* Zvětši číslo verze cache při každé další aktualizaci souborů. */
const CACHE_NAME='saja-akademie-android-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.all(ASSETS.map(async url=>{
      const response=await fetch(new Request(url,{cache:'reload'}));
      if(!response.ok)throw new Error('Offline soubor nebyl stažen: '+url);
      await cache.put(url,response);
    }));
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('saja-akademie-android-') && n!==CACHE_NAME).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{return await fetch(event.request);}
    catch(err){
      if(event.request.mode==='navigate')return (await caches.match('./index.html'));
      throw err;
    }
  })());
});
