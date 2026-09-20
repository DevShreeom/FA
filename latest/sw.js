/* Offline shell for the tracker. Only same-origin files are cached;
   YouTube API calls and thumbnails always go straight to the network. */
const VERSION = 'fa-tracker-v10';
const SHELL = ['./', './index.html', './offline.html', './404.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './humans.txt', './og-image.png', './fonts/inter-latin-wght-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {            // page: network first, fall back to the saved copy,
    e.respondWith(fetch(req).then(res => {   // and to a branded offline page if nothing was ever saved
      const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html').then(hit => hit || caches.match('./offline.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).catch(() => {
    if (req.destination === 'document') return caches.match('./offline.html');
  })));
});

/* The watcher posts its "new videos" notification through here, because that is
   the only route Android accepts. Tapping it should land you in the tracker,
   reusing a tab you already have open rather than piling up new ones. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const scope = new URL(self.registration.scope);
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (new URL(c.url).origin === scope.origin && 'focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});
