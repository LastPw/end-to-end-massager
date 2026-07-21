import { Buffer } from "buffer";
import { KeyHelper, SessionBuilder, SessionCipher, SignalProtocolAddress } from "@privacyresearch/libsignal-protocol-typescript";
import { SignalStore, resetSignalDb, exportSignalStore, importSignalStore } from "./signalStore";
const PREKEY_BATCH = 30;
const contextCache = new Map();
const encoder = new TextEncoder();
const decoder = new TextDecoder();
export function isSignalSupported() {
    return (typeof window !== "undefined" &&
        Boolean(window.isSecureContext) &&
        typeof crypto !== "undefined" &&
        Boolean(crypto.subtle));
}
function ensureBufferGlobal() {
    const globalAny = globalThis;
    if (!globalAny.Buffer) {
        globalAny.Buffer = Buffer;
    }
}
ensureBufferGlobal();
function toBase64(buffer) {
    return Buffer.from(new Uint8Array(buffer)).toString("base64");
}
function fromBase64(value) {
    const buffer = Buffer.from(value, "base64");
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
function binaryToBase64(value) {
    return Buffer.from(value, "binary").toString("base64");
}
function base64ToBinary(value) {
    return Buffer.from(value, "base64").toString("binary");
}
async function ensureFallbackKeyPair(context, force) {
    let publicKey = await context.store.getMeta("fallbackPublicKey");
    let privateKey = await context.store.getMeta("fallbackPrivateKey");
    if (!publicKey || !privateKey || force) {
        const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
        publicKey = toBase64(await crypto.subtle.exportKey("spki", pair.publicKey));
        privateKey = toBase64(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
        await context.store.setMeta("fallbackPublicKey", publicKey);
        await context.store.setMeta("fallbackPrivateKey", privateKey);
    }
    return { publicKey, privateKey };
}
async function encryptFallback(recipientPublicKey, plaintext) {
    const recipientKey = await crypto.subtle.importKey("spki", fromBase64(recipientPublicKey), { name: "ECDH", namedCurve: "P-256" }, false, []);
    const ephemeral = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "ECDH", public: recipientKey }, ephemeral.privateKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
    return {
        ephemeralPublicKey: toBase64(await crypto.subtle.exportKey("spki", ephemeral.publicKey)),
        iv: toBase64(iv.buffer),
        ciphertext: toBase64(encrypted)
    };
}
async function decryptFallback(context, fallback) {
    const privateKeyRaw = await context.store.getMeta("fallbackPrivateKey");
    if (!privateKeyRaw) {
        throw new Error("Fallback private key missing");
    }
    const privateKey = await crypto.subtle.importKey("pkcs8", fromBase64(privateKeyRaw), { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
    const ephemeralPublicKey = await crypto.subtle.importKey("spki", fromBase64(fallback.ephemeralPublicKey), { name: "ECDH", namedCurve: "P-256" }, false, []);
    const key = await crypto.subtle.deriveKey({ name: "ECDH", public: ephemeralPublicKey }, privateKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(fallback.iv) }, key, fromBase64(fallback.ciphertext));
    return decoder.decode(plaintext);
}
function serializeKeyPair(keyPair) {
    return JSON.stringify({
        pub: toBase64(keyPair.pubKey),
        priv: toBase64(keyPair.privKey)
    });
}
function parseKeyPair(raw) {
    const parsed = JSON.parse(raw);
    return {
        pubKey: fromBase64(parsed.pub),
        privKey: fromBase64(parsed.priv)
    };
}
function randomId() {
    return Math.floor(Math.random() * (2 ** 31 - 2)) + 1;
}
function createStorage(store) {
    return {
        async getIdentityKeyPair() {
            const raw = await store.getMeta("identityKeyPair");
            return raw ? parseKeyPair(raw) : undefined;
        },
        async getLocalRegistrationId() {
            const raw = await store.getMeta("registrationId");
            return raw ? Number(raw) : undefined;
        },
        async isTrustedIdentity(identifier, identityKey, _direction) {
            const existing = await store.getIdentity(identifier);
            if (!existing) {
                return true;
            }
            return existing === toBase64(identityKey);
        },
        async saveIdentity(encodedAddress, publicKey, _nonblockingApproval) {
            const serialized = toBase64(publicKey);
            const existing = await store.getIdentity(encodedAddress);
            await store.setIdentity(encodedAddress, serialized);
            return existing ? existing !== serialized : true;
        },
        async loadPreKey(keyId) {
            const raw = await store.getPreKey(Number(keyId));
            return raw ? parseKeyPair(raw) : undefined;
        },
        async storePreKey(keyId, keyPair) {
            await store.setPreKey(Number(keyId), serializeKeyPair(keyPair));
        },
        async removePreKey(keyId) {
            await store.deletePreKey(Number(keyId));
        },
        async storeSession(encodedAddress, record) {
            await store.setSession(encodedAddress, record);
        },
        async loadSession(encodedAddress) {
            const raw = await store.getSession(encodedAddress);
            return raw ?? undefined;
        },
        async loadSignedPreKey(keyId) {
            const raw = await store.getSignedPreKey(Number(keyId));
            return raw ? parseKeyPair(raw) : undefined;
        },
        async storeSignedPreKey(keyId, keyPair) {
            await store.setSignedPreKey(Number(keyId), serializeKeyPair(keyPair));
        },
        async removeSignedPreKey(keyId) {
            await store.setSignedPreKey(Number(keyId), "");
        }
    };
}
async function getContext(username) {
    const cached = contextCache.get(username);
    if (cached) {
        return cached;
    }
    const store = new SignalStore(`${username}:web-v1`);
    const storage = createStorage(store);
    const context = { username, store, storage };
    contextCache.set(username, context);
    return context;
}
async function resetPreKeys(store) {
    const raw = await store.getMeta("preKeyIds");
    const ids = raw ? JSON.parse(raw) : [];
    for (const id of ids) {
        await store.deletePreKey(id);
    }
    await store.setMeta("preKeyIds", JSON.stringify([]));
}
async function ensureIdentityKeys(context, force) {
    let identityKeyPair = await context.store.getMeta("identityKeyPair");
    let registrationId = await context.store.getMeta("registrationId");
    if (!identityKeyPair || !registrationId || force) {
        const newIdentity = await KeyHelper.generateIdentityKeyPair();
        const newRegistration = KeyHelper.generateRegistrationId();
        await context.store.setMeta("identityKeyPair", serializeKeyPair(newIdentity));
        await context.store.setMeta("registrationId", String(newRegistration));
        identityKeyPair = serializeKeyPair(newIdentity);
        registrationId = String(newRegistration);
    }
    return {
        identityKeyPair: parseKeyPair(identityKeyPair),
        registrationId: Number(registrationId)
    };
}
async function ensureSignedPreKey(context, identityKeyPair, force) {
    let signedPreKeyId = await context.store.getMeta("signedPreKeyId");
    let signedPreKeyRaw = await context.store.getMeta("signedPreKey");
    if (!signedPreKeyId || !signedPreKeyRaw || force) {
        const nextId = randomId();
        const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, nextId);
        await context.store.setMeta("signedPreKeyId", String(nextId));
        await context.store.setMeta("signedPreKey", JSON.stringify({
            keyPair: serializeKeyPair(signedPreKey.keyPair),
            signature: toBase64(signedPreKey.signature)
        }));
        signedPreKeyId = String(nextId);
        signedPreKeyRaw = await context.store.getMeta("signedPreKey");
    }
    const parsed = JSON.parse(signedPreKeyRaw);
    return {
        signedPreKeyId: Number(signedPreKeyId),
        signedPreKey: {
            keyId: Number(signedPreKeyId),
            keyPair: parseKeyPair(parsed.keyPair),
            signature: fromBase64(parsed.signature)
        }
    };
}
export async function ensureLocalKeys(username, force) {
    const context = await getContext(username);
    let signalDeviceIdRaw = await context.store.getMeta("signalDeviceId");
    if (!signalDeviceIdRaw) {
        signalDeviceIdRaw = String(randomId());
        await context.store.setMeta("signalDeviceId", signalDeviceIdRaw);
    }
    const signalDeviceId = Number(signalDeviceIdRaw);
    const fallbackKeyPair = await ensureFallbackKeyPair(context, force);
    const { identityKeyPair, registrationId } = await ensureIdentityKeys(context, force);
    const { signedPreKeyId, signedPreKey } = await ensureSignedPreKey(context, identityKeyPair, force);
    if (force) {
        await resetPreKeys(context.store);
    }
    const storedPreKeyIdsRaw = await context.store.getMeta("preKeyIds");
    const storedPreKeyIds = storedPreKeyIdsRaw
        ? JSON.parse(storedPreKeyIdsRaw)
        : [];
    const preKeys = [];
    if (!force) {
        for (const keyId of storedPreKeyIds) {
            const keyPair = await context.storage.loadPreKey(keyId);
            if (keyPair) {
                preKeys.push({ id: keyId, key: toBase64(keyPair.pubKey) });
            }
        }
    }
    while (preKeys.length < PREKEY_BATCH) {
        const keyId = randomId();
        const preKey = await KeyHelper.generatePreKey(keyId);
        await context.storage.storePreKey(keyId, preKey.keyPair);
        preKeys.push({ id: keyId, key: toBase64(preKey.keyPair.pubKey) });
    }
    await context.store.setMeta("preKeyIds", JSON.stringify(preKeys.map((entry) => entry.id)));
    await context.storage.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
    return {
        identityKey: toBase64(identityKeyPair.pubKey),
        registrationId,
        deviceId: signalDeviceId,
        signedPreKeyId,
        signedPreKey: toBase64(signedPreKey.keyPair.pubKey),
        signedPreKeySig: toBase64(signedPreKey.signature),
        fallbackPublicKey: fallbackKeyPair.publicKey,
        oneTimePreKeys: preKeys
    };
}
export async function hasLocalKeys(username) {
    const context = await getContext(username);
    const identityKeyPair = await context.store.getMeta("identityKeyPair");
    const registrationId = await context.store.getMeta("registrationId");
    const signedPreKeyId = await context.store.getMeta("signedPreKeyId");
    return Boolean(identityKeyPair && registrationId && signedPreKeyId);
}
export async function ensureSession(localUsername, remoteUsername, bundle) {
    const context = await getContext(localUsername);
    const address = new SignalProtocolAddress(remoteUsername, bundle.deviceId || 1);
    const existing = await context.storage.loadSession(address.toString());
    if (existing) {
        return;
    }
    const builder = new SessionBuilder(context.storage, address);
    await builder.processPreKey({
        registrationId: bundle.registrationId,
        identityKey: fromBase64(bundle.identityKey),
        signedPreKey: {
            keyId: bundle.signedPreKeyId,
            publicKey: fromBase64(bundle.signedPreKey),
            signature: fromBase64(bundle.signedPreKeySig)
        },
        preKey: bundle.oneTimePreKey
            ? {
                keyId: bundle.oneTimePreKey.id,
                publicKey: fromBase64(bundle.oneTimePreKey.key)
            }
            : undefined
    });
}
export async function encryptSignalMessage(localUsername, remoteUsername, deviceId, plaintext, fallbackPublicKey) {
    const context = await getContext(localUsername);
    const address = new SignalProtocolAddress(remoteUsername, deviceId || 1);
    const cipher = new SessionCipher(context.storage, address);
    const message = await cipher.encrypt(encoder.encode(plaintext).buffer);
    const body = message.body || "";
    const signalCiphertext = binaryToBase64(body);
    if (!fallbackPublicKey) {
        return {
            ciphertext: signalCiphertext,
            nonce: `signal:v1:${message.type}`
        };
    }
    const fallback = await encryptFallback(fallbackPublicKey, plaintext);
    return {
        ciphertext: JSON.stringify({
            v: 2,
            signal: signalCiphertext,
            fallback
        }),
        nonce: `signal:v2:${message.type}`
    };
}
export async function resetSignalState() {
    contextCache.clear();
    await resetSignalDb();
}
export async function exportSignalState() {
    return exportSignalStore();
}
export async function importSignalState(data) {
    contextCache.clear();
    await importSignalStore(data);
}
export async function resetSignalSession(localUsername, remoteUsername, deviceId) {
    const context = await getContext(localUsername);
    const address = new SignalProtocolAddress(remoteUsername, deviceId || 1);
    await context.store.deleteSession(address.toString());
}
export async function decryptSignalMessage(localUsername, remoteUsername, deviceId, ciphertext, nonce) {
    const context = await getContext(localUsername);
    const address = new SignalProtocolAddress(remoteUsername, deviceId || 1);
    const cipher = new SessionCipher(context.storage, address);
    const typeRaw = nonce.split(":")[2] || "1";
    const parsedType = Number(typeRaw);
    const type = parsedType === 3 ? 3 : 1;
    let signalCiphertext = ciphertext;
    let fallback;
    if (nonce.startsWith("signal:v2:")) {
        const parsed = JSON.parse(ciphertext);
        if (parsed.v !== 2 ||
            typeof parsed.signal !== "string" ||
            !parsed.fallback ||
            typeof parsed.fallback.ephemeralPublicKey !== "string" ||
            typeof parsed.fallback.iv !== "string" ||
            typeof parsed.fallback.ciphertext !== "string") {
            throw new Error("Invalid encrypted message payload");
        }
        signalCiphertext = parsed.signal;
        fallback = parsed.fallback;
    }
    const binary = base64ToBinary(signalCiphertext);
    try {
        const plaintext = type === 3
            ? await cipher.decryptPreKeyWhisperMessage(binary, "binary")
            : await cipher.decryptWhisperMessage(binary, "binary");
        return decoder.decode(new Uint8Array(plaintext));
    }
    catch (error) {
        // Fallback to the other decrypt mode for mixed/legacy traffic.
        try {
            const alternatePlaintext = type === 3
                ? await cipher.decryptWhisperMessage(binary, "binary")
                : await cipher.decryptPreKeyWhisperMessage(binary, "binary");
            return decoder.decode(new Uint8Array(alternatePlaintext));
        }
        catch (fallbackError) {
            if (fallback) {
                return decryptFallback(context, fallback);
            }
            // A duplicate or out-of-order delivery must not destroy the ratchet
            // session. The caller keeps the ciphertext and can retry later.
            throw fallbackError;
        }
    }
}
export async function createSenderKeyDistribution() {
    throw new Error("Sender keys are not supported in the browser build.");
}
export async function processSenderKeyDistribution() {
    throw new Error("Sender keys are not supported in the browser build.");
}
export async function encryptGroupMessage() {
    throw new Error("Group sender keys are not supported in the browser build.");
}
export async function decryptGroupMessage() {
    throw new Error("Group sender keys are not supported in the browser build.");
}
export function hasSenderKeySent() {
    return false;
}
export function markSenderKeySent() {
    // no-op
}
