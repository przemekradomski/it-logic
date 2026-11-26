const CACHE_NAME = 'it-logic-pwa-v2'
const APP_SHELL = '/'
const OFFLINE_FILES = [
  APP_SHELL,
  '/static/js/main.js',
  '/static/assets/main.css',
  '/static/manifest.webmanifest',
  '/static/icons/pwa-192.png',
  '/static/icons/pwa-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('it-logic-pwa-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API requests always reach Django so cached data cannot be mistaken for live data.
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && url.pathname === APP_SHELL) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, copy))
          }
          return response
        })
        .catch(async () => (await caches.match(APP_SHELL)) || Response.error())
    )
    return
  }

  // Cache built frontend assets for faster repeat visits and offline rendering.
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
      })
    )
  }
})
