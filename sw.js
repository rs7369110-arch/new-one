
const CACHE_NAME = 'digital-edu-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Initial cache failed, Service Worker will cache on-the-fly:', err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') return;
  
  // Skip non-http schemes like chrome-extension
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request).then(networkResponse => {
          // Check if valid response to cache
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Silent fail for network errors if no cache
          return new Response('Network error occurred while offline');
        });
      })
  );
});
