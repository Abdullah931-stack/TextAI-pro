// ============================================
// TextAIpro - Service Worker
// ============================================
// Provides offline functionality and caching

const CACHE_NAME = 'textaipro-v1';
const STATIC_CACHE = 'textaipro-static-v1';
const DYNAMIC_CACHE = 'textaipro-dynamic-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-192.png',
    '/icons/icon-maskable-512.png',
    // Stylesheets
    '/src/styles/index.css',
    '/src/styles/layout.css',
    '/src/styles/components.css',
    '/src/styles/animations.css',
    '/src/styles/mobile.css',
    // Main JavaScript
    '/src/main.js',
    // App modules
    '/src/app/editor.js',
    '/src/app/fileSystem.js',
    '/src/app/mobile.js',
    '/src/app/modals.js',
    '/src/app/sidebar.js',
    '/src/app/state.js',
    '/src/app/toast.js',
    '/src/app/toolbar.js',
    // Services
    '/src/services/fileService.js',
    '/src/services/geminiService.js',
    '/src/services/pdfService.js',
    // Utils
    '/src/utils/bidirectional.js',
    '/src/utils/sanitize.js',
    '/src/utils/storage.js',
    // Config
    '/src/config/config.js'
];

// External resources (CDN) - cache with network-first strategy
const EXTERNAL_PATTERNS = [
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /site-assets\.fontawesome\.com/,
    /cdnjs\.cloudflare\.com/
];

// API endpoints - always network first
const API_PATTERNS = [
    /\/api\//,
    /generativelanguage\.googleapis\.com/
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                // Cache assets one by one to handle failures gracefully
                return Promise.allSettled(
                    STATIC_ASSETS.map(asset =>
                        cache.add(asset).catch(err => {
                            console.warn(`[SW] Failed to cache: ${asset}`, err);
                        })
                    )
                );
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('[SW] Install failed:', err);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            // Delete old versions of our caches
                            return name.startsWith('textaipro-') &&
                                name !== STATIC_CACHE &&
                                name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log(`[SW] Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // API requests - Network First
    if (isApiRequest(url)) {
        event.respondWith(networkFirst(request));
        return;
    }

    // External resources (fonts, icons) - Stale While Revalidate
    if (isExternalResource(url)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Static assets - Cache First
    event.respondWith(cacheFirst(request));
});

/**
 * Check if request is an API call
 */
function isApiRequest(url) {
    return API_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if request is an external resource
 */
function isExternalResource(url) {
    return EXTERNAL_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Cache First strategy - for static assets
 * Try cache first, fall back to network
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First failed:', error);
        // Return offline fallback if available
        return caches.match('/index.html');
    }
}

/**
 * Network First strategy - for API requests
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network First - falling back to cache');
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return error response for API failures
        return new Response(JSON.stringify({
            error: 'أنت غير متصل بالإنترنت',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale While Revalidate strategy - for external resources
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // Fetch from network in background
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    // Return cached response immediately if available
    return cachedResponse || fetchPromise;
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('[SW] Service Worker loaded');
