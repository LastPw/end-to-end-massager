const DB_NAME = "messager-signal";
const DB_VERSION = 1;
const STORE_NAME = "signal";
let dbPromise = null;
let dbInstance = null;
function openDb() {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
    return dbPromise;
}
async function getItem(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => {
            resolve(typeof request.result === "string" ? request.result : null);
        };
        request.onerror = () => reject(request.error);
    });
}
async function setItem(key, value) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
async function deleteItem(key) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
export async function exportSignalStore() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = {};
        const request = store.openCursor();
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                if (typeof cursor.value === "string") {
                    data[String(cursor.key)] = cursor.value;
                }
                cursor.continue();
            }
            else {
                resolve(data);
            }
        };
        request.onerror = () => reject(request.error);
    });
}
export async function importSignalStore(data) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        for (const [key, value] of Object.entries(data)) {
            store.put(value, key);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
export async function resetSignalDb() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
    dbPromise = null;
    await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
    });
}
export class SignalStore {
    namespace;
    constructor(namespace) {
        this.namespace = namespace;
    }
    key(prefix, id) {
        return `${this.namespace}:${prefix}:${id}`;
    }
    async getMeta(id) {
        return getItem(this.key("meta", id));
    }
    async setMeta(id, value) {
        await setItem(this.key("meta", id), value);
    }
    async deleteMeta(id) {
        await deleteItem(this.key("meta", id));
    }
    async getIdentity(keyId) {
        return getItem(this.key("identity", keyId));
    }
    async setIdentity(keyId, value) {
        await setItem(this.key("identity", keyId), value);
    }
    async getSession(keyId) {
        return getItem(this.key("session", keyId));
    }
    async setSession(keyId, value) {
        await setItem(this.key("session", keyId), value);
    }
    async deleteSession(keyId) {
        await deleteItem(this.key("session", keyId));
    }
    async getPreKey(preKeyId) {
        return getItem(this.key("prekey", preKeyId));
    }
    async setPreKey(preKeyId, value) {
        await setItem(this.key("prekey", preKeyId), value);
    }
    async deletePreKey(preKeyId) {
        await deleteItem(this.key("prekey", preKeyId));
    }
    async getSignedPreKey(signedPreKeyId) {
        return getItem(this.key("signed-prekey", signedPreKeyId));
    }
    async setSignedPreKey(signedPreKeyId, value) {
        await setItem(this.key("signed-prekey", signedPreKeyId), value);
    }
    async getSenderKey(keyId) {
        return getItem(this.key("sender-key", keyId));
    }
    async setSenderKey(keyId, value) {
        await setItem(this.key("sender-key", keyId), value);
    }
}
