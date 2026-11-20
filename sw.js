/* MaxEndurance PWA: cache app assets, Leaflet, and ArcGIS map tiles after they are viewed online. */
const CACHE_NAME = "maxendurance-shell-v3";
const TILE_CACHE = "maxendurance-map-tiles-v1";
const TILE_CACHE_LIMIT = 1200;
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("maxendurance-") && key !== CACHE_NAME && key !== TILE_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function trimTileCache(cache) {
  const keys = await cache.keys();
  if (keys.length > TILE_CACHE_LIMIT) {
    await Promise.all(keys.slice(0, keys.length - TILE_CACHE_LIMIT).map(key => cache.delete(key)));
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // ArcGIS World Imagery tiles: cache each tile after it is viewed online,
  // then serve that exact tile from cache when offline.
  const isArcGisTile = url.hostname === "server.arcgisonline.com" && /\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\//i.test(url.pathname);
  if (isArcGisTile) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) {
          await cache.put(request, response.clone());
          await trimTileCache(cache);
        }
        return response;
      } catch (error) {
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        throw error;
      }
    })());
    return;
  }

  // App files: cache same-origin resources. Use cached copies first for reliable offline use.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        if (request.mode === "navigate") return (await cache.match("./index.html")) || (await cache.match("./"));
        throw error;
      }
    })());
    return;
  }

  // Cache Leaflet library files from the CDN after first successful online load.
  if ((url.hostname === "unpkg.com" || url.hostname === "cdn.jsdelivr.net") && /leaflet/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        throw error;
      }
    })());
  }
});
