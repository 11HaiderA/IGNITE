const CACHE_NAME = 'matchsticks-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/screens.css',
  './css/popups.css',
  './js/main.js',
  './js/audio.js',
  './js/storage.js',
  './js/ads.js',
  './js/game/model.js',
  './js/game/solver.js',
  './js/game/generator.js',
  './js/game/render.js',
  './js/game/input.js',
  './js/ui/splash.js',
  './js/ui/home.js',
  './js/ui/settings.js',
  './js/ui/pause.js',
  './js/ui/hint.js',
  './js/ui/win.js',
  './js/ui/levels.js',
  './js/ui/howtoplay.js',
  './levels/levels.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
