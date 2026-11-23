/* Mari Matters: cache only public static files. Never cache user profiles, database calls, authorisation, certificates or private pages. */
const CACHE='mari-static-v1';
const PREPARE=['/offline.html','/mari-icon.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.addAll(PREPARE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).catch(()=>caches.match('/offline.html')));
  return;
 }
 if(!url.pathname.startsWith('/assets/')&&!['/mari-icon.svg','/manifest.webmanifest'].includes(url.pathname))return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok&&res.type==='basic'){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
  return res;
 })));
});