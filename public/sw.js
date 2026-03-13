// sw.js — Service Worker for WorkFlow HR PWA
// Saves key files to cache so app loads even offline
// MuleSoft analogy: Like an Object Store caching API responses

const CACHE_NAME = "workflow-hr-v1";

// Files to cache for offline use
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/manifest.json",
];

// ── INSTALL: Cache static files on first load ──
self.addEventListener("install", (event) => {
  console.log("WorkFlow HR: Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("WorkFlow HR: Caching app shell");
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some files might not exist yet — that's OK
        console.log("WorkFlow HR: Some files not cached — will try later");
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: Clean up old caches ──
self.addEventListener("activate", (event) => {
  console.log("WorkFlow HR: Service Worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("WorkFlow HR: Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Network first, fall back to cache ──
// API calls always go to network (need fresh data)
// Static files served from cache when offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always fetch API calls from network (fresh employee data)
  if (url.hostname.includes("onrender.com")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "You are offline. Please reconnect." }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // For everything else: try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save fresh copy to cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/index.html");
        });
      })
  );
});
