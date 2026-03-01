const CACHE_NAME = 'campus-parcel-secure-v3';
const urlsToCache = [
  './',
  './index.html',
  './delivery.html',
  './pickup.html',
  './admin.html',
  './styles.css',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Always use network for API calls so dashboard values stay fresh.
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For same-origin pages/assets, prefer network and fallback to cache.
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For cross-origin requests, fallback to cache if network fails.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
