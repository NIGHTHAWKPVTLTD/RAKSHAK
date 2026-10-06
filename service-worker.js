const CACHE_NAME = 'rakshak-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/emergency.html',
    '/family.html',
    '/js/config.js',
    '/js/sos.js',
    '/assets/alert-sound.mp3'
];

// Install & Cache Core Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Serve from Cache if Offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            // Offline Fallback route
            if (event.request.mode === 'navigate') {
                return caches.match('/dashboard.html');
            }
        })
    );
});
