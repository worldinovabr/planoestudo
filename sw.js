const CACHE_NAME = 'planner-cache-v1';
const assets = ['index.html','styles.css','app.js','manifest.json'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(assets)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
// Novo projeto Planner PWA - service worker será gerado do zero
