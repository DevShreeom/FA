// Factorial Academy — service worker
// Scope: makes the app installable on Android/desktop and shows a branded
// offline page instead of the browser's default one. It deliberately does
// NOT cache Firebase/Firestore/YouTube requests — this app is live data,
// and a stale cached response would be worse than a network error.

const VERSION = 'fa-shell-v1';
const SHELL = [
  './', './index.html', './styles.css', './portalPromo.css',
  './main.js', './auth.js', './firebase.js', './config.js',
  './studentView.js', './leaderboard.js', './updates.js', './heatmap.js',
  './classAnalytics.js', './customLectures.js', './qotd.js', './qotdView.js',
  './qotdRecommend.js', './metrics.js', './data.js', './allVideos.js',
  './allVideosData.js', './ytApi.js', './ytFeed.js', './adminCheck.js',
  './portalPromo.js', './manifest.webmanifest',
  './logot.png', './offline.html', './404.html',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isLiveDataRequest(url) {
  return /firestore|firebaseio|googleapis|identitytoolkit|youtube/.test(url);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  // Never intercept Firebase / Firestore / YouTube / auth traffic — always live.
  if (isLiveDataRequest(url)) return;

  // Page navigations: try the network first so logged-in users always see
  // fresh content; fall back to the cached shell, then the offline page.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./offline.html')))
    );
    return;
  }

  // Same-origin static assets: cache-first, refresh in the background.
  if (url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const network = fetch(req).then((res) => {
          if (res && res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => hit);
        return hit || network;
      })
    );
  }
});
