type CachedMessage = {
  cacheId: string;
  username: string;
  id: number | string;
  groupId: string;
  conversationId: number;
  sender: string;
  createdAt: number;
  deletedAt: number | null;
  ciphertext: string;
  nonce: string;
  senderDeviceId: number;
  plaintext?: string;
};

type CachedMedia = {
  cacheId: string;
  username: string;
  id: string;
  conversationId: number;
  sender: string;
  kind: "image" | "video" | "audio" | "file";
  url: string;
  createdAt: number;
  storageKey?: string;
  contentType?: string;
};

const DB_NAME = "messager-cache";
const DB_VERSION = 2;
const STORE_MESSAGES = "messages";
const STORE_MEDIA = "media";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        const store = db.createObjectStore(STORE_MESSAGES, { keyPath: "cacheId" });
        store.createIndex("by_username", "username", { unique: false });
        store.createIndex("by_created", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        const store = db.createObjectStore(STORE_MEDIA, { keyPath: "cacheId" });
        store.createIndex("by_username", "username", { unique: false });
        store.createIndex("by_created", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function cacheEncryptedMessages(
  username: string,
  rows: Array<{
    id: number | string;
    group_id: string;
    conversation_id: number;
    sender_username: string;
    sender_device_id?: string;
    ciphertext: string;
    nonce: string;
    created_at: number;
    deleted_at?: number | null;
  }>
): Promise<void> {
  if (!rows.length) {
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    for (const row of rows) {
      const cacheId = `${username}:${row.id}`;
      const record: CachedMessage = {
        cacheId,
        username,
        id: row.id,
        groupId: row.group_id,
        conversationId: row.conversation_id,
        sender: row.sender_username,
        createdAt: row.created_at,
        deletedAt: row.deleted_at ?? null,
        ciphertext: row.ciphertext,
        nonce: row.nonce,
        senderDeviceId: Number(row.sender_device_id) || 1
      };
      const existingRequest = store.get(cacheId);
      existingRequest.onsuccess = () => {
        const existing = existingRequest.result as CachedMessage | undefined;
        store.put({
          ...record,
          plaintext: existing?.plaintext
        });
      };
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheDecryptedMessage(
  username: string,
  id: number | string,
  plaintext: string,
  row?: {
    group_id: string;
    conversation_id: number;
    sender_username: string;
    sender_device_id?: string;
    ciphertext: string;
    nonce: string;
    created_at: number;
    deleted_at?: number | null;
  }
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    const cacheId = `${username}:${id}`;
    const request = store.get(cacheId);
    request.onsuccess = () => {
      const existing = request.result as CachedMessage | undefined;
      if (existing) {
        store.put({ ...existing, plaintext });
      } else if (row) {
        store.put({
          cacheId,
          username,
          id,
          groupId: row.group_id,
          conversationId: row.conversation_id,
          sender: row.sender_username,
          createdAt: row.created_at,
          deletedAt: row.deleted_at ?? null,
          ciphertext: row.ciphertext,
          nonce: row.nonce,
          senderDeviceId: Number(row.sender_device_id) || 1,
          plaintext
        } satisfies CachedMessage);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadCachedMessages(
  username: string,
  limit = 800,
  ttlMs?: number
): Promise<CachedMessage[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MESSAGES, "readonly");
    const store = tx.objectStore(STORE_MESSAGES);
    const index = store.index("by_username");
    const request = index.openCursor(IDBKeyRange.only(username));
    const results: CachedMessage[] = [];
    const cutoff = ttlMs ? Date.now() - ttlMs : null;
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const row = cursor.value as CachedMessage;
      if (!cutoff || row.createdAt >= cutoff) {
        results.push(row);
      }
      if (results.length >= limit) {
        resolve(results);
        return;
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function pruneCachedMessages(
  username: string,
  maxEntries = 2000,
  ttlMs?: number
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    const index = store.index("by_username");
    const request = index.getAll(IDBKeyRange.only(username));
    request.onsuccess = () => {
      const rows = (request.result as CachedMessage[]) || [];
      const cutoff = ttlMs ? Date.now() - ttlMs : null;
      if (cutoff) {
        for (const row of rows) {
          if (row.createdAt < cutoff) {
            store.delete(row.cacheId);
          }
        }
      }
      if (rows.length <= maxEntries && !cutoff) {
        resolve();
        return;
      }
      rows.sort((a, b) => a.createdAt - b.createdAt);
      const toDelete = rows.slice(0, Math.max(0, rows.length - maxEntries));
      for (const row of toDelete) {
        store.delete(row.cacheId);
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearCachedMessages(username: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MESSAGES, "readwrite");
    const store = tx.objectStore(STORE_MESSAGES);
    const index = store.index("by_username");
    const request = index.openCursor(IDBKeyRange.only(username));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function cacheMediaItems(
  username: string,
  items: Array<{
    id: string;
    conversationId: number;
    sender: string;
    kind: "image" | "video" | "audio" | "file";
    url: string;
    createdAt: number;
    storageKey?: string;
    contentType?: string;
  }>
): Promise<void> {
  if (!items.length) {
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, "readwrite");
    const store = tx.objectStore(STORE_MEDIA);
    for (const item of items) {
      const record: CachedMedia = {
        cacheId: `${username}:${item.id}`,
        username,
        id: item.id,
        conversationId: item.conversationId,
        sender: item.sender,
        kind: item.kind,
        url: item.url,
        createdAt: item.createdAt,
        storageKey: item.storageKey,
        contentType: item.contentType
      };
      store.put(record);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadCachedMedia(
  username: string,
  limit = 800,
  ttlMs?: number
): Promise<CachedMedia[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, "readonly");
    const store = tx.objectStore(STORE_MEDIA);
    const index = store.index("by_username");
    const request = index.openCursor(IDBKeyRange.only(username));
    const results: CachedMedia[] = [];
    const cutoff = ttlMs ? Date.now() - ttlMs : null;
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const row = cursor.value as CachedMedia;
      if (!cutoff || row.createdAt >= cutoff) {
        results.push(row);
      }
      if (results.length >= limit) {
        resolve(results);
        return;
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function pruneCachedMedia(
  username: string,
  maxEntries = 2000,
  ttlMs?: number
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, "readwrite");
    const store = tx.objectStore(STORE_MEDIA);
    const index = store.index("by_username");
    const request = index.getAll(IDBKeyRange.only(username));
    request.onsuccess = () => {
      const rows = (request.result as CachedMedia[]) || [];
      const cutoff = ttlMs ? Date.now() - ttlMs : null;
      if (cutoff) {
        for (const row of rows) {
          if (row.createdAt < cutoff) {
            store.delete(row.cacheId);
          }
        }
      }
      if (rows.length <= maxEntries && !cutoff) {
        resolve();
        return;
      }
      rows.sort((a, b) => a.createdAt - b.createdAt);
      const toDelete = rows.slice(0, Math.max(0, rows.length - maxEntries));
      for (const row of toDelete) {
        store.delete(row.cacheId);
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearCachedMedia(username: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, "readwrite");
    const store = tx.objectStore(STORE_MEDIA);
    const index = store.index("by_username");
    const request = index.openCursor(IDBKeyRange.only(username));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCacheStats(username: string): Promise<{
  messages: number;
  media: number;
  bytes: number;
}> {
  const db = await openDb();
  const [messages, media] = await Promise.all([
    new Promise<CachedMessage[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, "readonly");
      const store = tx.objectStore(STORE_MESSAGES);
      const index = store.index("by_username");
      const request = index.getAll(IDBKeyRange.only(username));
      request.onsuccess = () => resolve((request.result as CachedMessage[]) || []);
      request.onerror = () => reject(request.error);
    }),
    new Promise<CachedMedia[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, "readonly");
      const store = tx.objectStore(STORE_MEDIA);
      const index = store.index("by_username");
      const request = index.getAll(IDBKeyRange.only(username));
      request.onsuccess = () => resolve((request.result as CachedMedia[]) || []);
      request.onerror = () => reject(request.error);
    })
  ]);

  let bytes = 0;
  for (const row of messages) {
    bytes += JSON.stringify(row).length;
  }
  for (const row of media) {
    bytes += JSON.stringify(row).length;
  }

  return {
    messages: messages.length,
    media: media.length,
    bytes
  };
}
