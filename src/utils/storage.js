// ============================================
// TextAIpro - IndexedDB Storage Utility
// ============================================
// Uses IndexedDB for persistent file system storage

const DB_NAME = 'TextAIproDB';
const DB_VERSION = 2; // Incremented for keyRotationState store
const STORE_NAME = 'fileSystem';

let db = null;

/**
 * Initialize the IndexedDB database
 */
export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create file system store
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('path', 'path', { unique: true });
                store.createIndex('parentId', 'parentId', { unique: false });
            }

            // Create key rotation state store (added in v2)
            if (!database.objectStoreNames.contains('keyRotationState')) {
                database.createObjectStore('keyRotationState', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Get all items from the file system store
 */
export async function getAllItems() {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get a single item by ID
 */
export async function getItem(id) {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Add or update an item
 */
export async function saveItem(item) {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete an item by ID
 */
export async function deleteItem(id) {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear all items
 */
export async function clearAll() {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get children of a folder
 */
export async function getChildren(parentId) {
    return new Promise((resolve, reject) => {
        if (!db) return reject(new Error('Database not initialized'));

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('parentId');
        const request = index.getAll(parentId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generate unique ID
 */
export function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
