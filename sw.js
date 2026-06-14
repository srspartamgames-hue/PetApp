const CACHE = 'petapp-v3';
const ASSETS = [
  './', './index.html', './manifest.json', './css/styles.css',
  './js/app.js', './js/state.js', './js/db.js', './js/dates.js', './js/alerts.js',
  './js/backup.js', './js/icons.js', './js/ui.js', './js/notify.js',
  './js/theme.js', './js/mascots.js', './js/confetti.js', './js/demo-seed.js',
  './js/components/accordion.js', './js/components/recordSection.js',
  './js/components/chart.js', './js/components/petSwitcher.js',
  './js/views/inicio.js', './js/views/saude.js', './js/views/rotina.js',
  './js/views/alertas.js', './js/views/pet.js', './js/views/tutor.js',
  './fonts/fredoka-600.woff2', './fonts/fredoka-700.woff2',
  './fonts/nunito-600.woff2', './fonts/nunito-700.woff2', './fonts/nunito-800.woff2',
  './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
    return res;
  }).catch(() => caches.match('./index.html'))));
});
