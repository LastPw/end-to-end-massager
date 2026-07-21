import { Buffer } from "buffer";
import {
  Direction,
  KeyHelper,
  SessionBuilder,
  SessionCipher,
  SignalProtocolAddress,
  type KeyPairType,
  type SignedPreKeyPairType,
  type StorageType
} from "@privacyresearch/libsignal-protocol-typescript";
import {
  SignalStore,
  resetSignalDb,
  exportSignalStore,
  importSignalStore
} from "./signalStore";

const PREKEY_BATCH = 30;

const contextCache = new Map<string, SignalContext>();

type SignalContext = {
  username: string;
  store: SignalStore;
  storage: StorageType;
};

type LocalKeyBundle = {
  identityKey: string;
  registrationId: number;
  deviceId: number;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySig: string;
  fallbackPublicKey: string;
  oneTimePreKeys: Array<{ id: number; key: string }>;
};

type DeviceBundle = {
  registrationId: number;
  deviceId: number;
  sessionDeviceId?: string;
  identityKey: string;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySig: string;
  fallbackPublicKey?: string;
  oneTimePreKey?: { id: number; key: string } | null;
};

type FallbackCiphertext = {
  ephemeralPublicKey: string;
  iv: string;
  ciphertext: string;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function isSignalSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.isSecureContext) &&
    typeof crypto !== "undefined" &&
    Boolean(crypto.subtle)
  );
}

function ensureBufferGlobal() {
  const globalAny = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
  if (!globalAny.Buffer) {
    globalAny.Buffer = Buffer;
  }
}

ensureBufferGlobal();

function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(buffer)).toString("base64");
}

function fromBase64(value: string): ArrayBuffer {
  const buffer = Buffer.from(value, "base64");
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function binaryToBase64(value: string): string {
  return Buffer.from(value, "binary").toString("base64");
}

function base64ToBinary(value: string): string {
  return Buffer.from(value, "base64").toString("binary");
}

async function ensureFallbackKeyPair(
  context: SignalContext,
  force: boolean
): Promise<{ publicKey: string; privateKey: string }> {
  let publicKey = await context.store.getMeta("fallbackPublicKey");
  let privateKey = await context.store.getMeta("fallbackPrivateKey");
  if (!publicKey || !privateKey || force) {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );
    publicKey = toBase64(await crypto.subtle.exportKey("spki", pair.publicKey));
    privateKey = toBase64(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
    await context.store.setMeta("fallbackPublicKey", publicKey);
    await context.store.setMeta("fallbackPrivateKey", privateKey);
  }
  return { publicKey, privateKey };
}

async function encryptFallback(
  recipientPublicKey: string,
  plaintext: string
): Promise<FallbackCiphertext> {
  const recipientKey = await crypto.subtle.importKey(
    "spki",
    fromBase64(recipientPublicKey),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const ephemeral = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientKey },
    ephemeral.privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );
  return {
    ephemeralPublicKey: toBase64(
      await crypto.subtle.exportKey("spki", ephemeral.publicKey)
    ),
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(encrypted)
  };
}

async function decryptFallback(
  context: SignalContext,
  fallback: FallbackCiphertext
): Promise<string> {
  const privateKeyRaw = await context.store.getMeta("fallbackPrivateKey");
  if (!privateKeyRaw) {
    throw new Error("Fallback private key missing");
  }
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    fromBase64(privateKeyRaw),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"]
  );
  const ephemeralPublicKey = await crypto.subtle.importKey(
    "spki",
    fromBase64(fallback.ephemeralPublicKey),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const key = await crypto.subtle.deriveKey(
    { name: "ECDH", public: ephemeralPublicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(fallback.iv) },
    key,
    fromBase64(fallback.ciphertext)
  );
  return decoder.decode(plaintext);
}

function serializeKeyPair(keyPair: KeyPairType): string {
  return JSON.stringify({
    pub: toBase64(keyPair.pubKey),
    priv: toBase64(keyPair.privKey)
  });
}

function parseKeyPair(raw: string): KeyPairType {
  const parsed = JSON.parse(raw) as { pub: string; priv: string };
  return {
    pubKey: fromBase64(parsed.pub),
    privKey: fromBase64(parsed.priv)
  };
}

function randomId(): number {
  return Math.floor(Math.random() * (2 ** 31 - 2)) + 1;
}

function createStorage(store: SignalStore): StorageType {
  return {
    async getIdentityKeyPair() {
      const raw = await store.getMeta("identityKeyPair");
      return raw ? parseKeyPair(raw) : undefined;
    },
    async getLocalRegistrationId() {
      const raw = await store.getMeta("registrationId");
      return raw ? Number(raw) : undefined;
    },
    async isTrustedIdentity(
      identifier: string,
      identityKey: ArrayBuffer,
      _direction: Direction
    ) {
      const existing = await store.getIdentity(identifier);
      if (!existing) {
        return true;
      }
      return existing === toBase64(identityKey);
    },
    async saveIdentity(
      encodedAddress: string,
      publicKey: ArrayBuffer,
      _nonblockingApproval?: boolean
    ) {
      const serialized = toBase64(publicKey);
      const existing = await store.getIdentity(encodedAddress);
      await store.setIdentity(encodedAddress, serialized);
      return existing ? existing !== serialized : true;
    },
    async loadPreKey(keyId: number | string) {
      const raw = await store.getPreKey(Number(keyId));
      return raw ? parseKeyPair(raw) : undefined;
    },
    async storePreKey(keyId: number | string, keyPair: KeyPairType) {
      await store.setPreKey(Number(keyId), serializeKeyPair(keyPair));
    },
    async removePreKey(keyId: number | string) {
      await store.deletePreKey(Number(keyId));
    },
    async storeSession(encodedAddress: string, record: string) {
      await store.setSession(encodedAddress, record);
    },
    async loadSession(encodedAddress: string) {
      const raw = await store.getSession(encodedAddress);
      return raw ?? undefined;
    },
    async loadSignedPreKey(keyId: number | string) {
      const raw = await store.getSignedPreKey(Number(keyId));
      return raw ? parseKeyPair(raw) : undefined;
    },
    async storeSignedPreKey(keyId: number | string, keyPair: KeyPairType) {
      await store.setSignedPreKey(Number(keyId), serializeKeyPair(keyPair));
    },
    async removeSignedPreKey(keyId: number | string) {
      await store.setSignedPreKey(Number(keyId), "");
    }
  };
}

async function getContext(username: string): Promise<SignalContext> {
  const cached = contextCache.get(username);
  if (cached) {
    return cached;
  }
  const store = new SignalStore(`${username}:web-v1`);
  const storage = createStorage(store);
  const context: SignalContext = { username, store, storage };
  contextCache.set(username, context);
  return context;
}

async function resetPreKeys(store: SignalStore) {
  const raw = await store.getMeta("preKeyIds");
  const ids = raw ? (JSON.parse(raw) as number[]) : [];
  for (const id of ids) {
    await store.deletePreKey(id);
  }
  await store.setMeta("preKeyIds", JSON.stringify([]));
}

async function ensureIdentityKeys(
  context: SignalContext,
  force: boolean
): Promise<{ identityKeyPair: KeyPairType; registrationId: number }> {
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

async function ensureSignedPreKey(
  context: SignalContext,
  identityKeyPair: KeyPairType,
  force: boolean
): Promise<{ signedPreKeyId: number; signedPreKey: SignedPreKeyPairType }> {
  let signedPreKeyId = await context.store.getMeta("signedPreKeyId");
  let signedPreKeyRaw = await context.store.getMeta("signedPreKey");

  if (!signedPreKeyId || !signedPreKeyRaw || force) {
    const nextId = randomId();
    const signedPreKey = await KeyHelper.generateSignedPreKey(
      identityKeyPair,
      nextId
    );
    await context.store.setMeta("signedPreKeyId", String(nextId));
    await context.store.setMeta(
      "signedPreKey",
      JSON.stringify({
        keyPair: serializeKeyPair(signedPreKey.keyPair),
        signature: toBase64(signedPreKey.signature)
      })
    );
    signedPreKeyId = String(nextId);
    signedPreKeyRaw = await context.store.getMeta("signedPreKey");
  }

  const parsed = JSON.parse(signedPreKeyRaw!) as {
    keyPair: string;
    signature: string;
  };

  return {
    signedPreKeyId: Number(signedPreKeyId),
    signedPreKey: {
      keyId: Number(signedPreKeyId),
      keyPair: parseKeyPair(parsed.keyPair),
      signature: fromBase64(parsed.signature)
    }
  };
}

export async function ensureLocalKeys(
  username: string,
  force: boolean
): Promise<LocalKeyBundle | null> {
  const context = await getContext(username);
  let signalDeviceIdRaw = await context.store.getMeta("signalDeviceId");
  if (!signalDeviceIdRaw) {
    signalDeviceIdRaw = String(randomId());
    await context.store.setMeta("signalDeviceId", signalDeviceIdRaw);
  }
  const signalDeviceId = Number(signalDeviceIdRaw);
  const fallbackKeyPair = await ensureFallbackKeyPair(context, force);
  const { identityKeyPair, registrationId } = await ensureIdentityKeys(
    context,
    force
  );
  const { signedPreKeyId, signedPreKey } = await ensureSignedPreKey(
    context,
    identityKeyPair,
    force
  );

  if (force) {
    await resetPreKeys(context.store);
  }

  const storedPreKeyIdsRaw = await context.store.getMeta("preKeyIds");
  const storedPreKeyIds = storedPreKeyIdsRaw
    ? (JSON.parse(storedPreKeyIdsRaw) as number[])
    : [];
  const preKeys: Array<{ id: number; key: string }> = [];

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
  await context.store.setMeta(
    "preKeyIds",
    JSON.stringify(preKeys.map((entry) => entry.id))
  );

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

export async function hasLocalKeys(username: string): Promise<boolean> {
  const context = await getContext(username);
  const identityKeyPair = await context.store.getMeta("identityKeyPair");
  const registrationId = await context.store.getMeta("registrationId");
  const signedPreKeyId = await context.store.getMeta("signedPreKeyId");
  return Boolean(identityKeyPair && registrationId && signedPreKeyId);
}

export async function ensureSession(
  localUsername: string,
  remoteUsername: string,
  bundle: DeviceBundle
): Promise<void> {
  const context = await getContext(localUsername);
  const address = new SignalProtocolAddress(
    remoteUsername,
    bundle.deviceId || 1
  );

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

export async function encryptSignalMessage(
  localUsername: string,
  remoteUsername: string,
  deviceId: number,
  plaintext: string,
  fallbackPublicKey?: string
): Promise<{ ciphertext: string; nonce: string }> {
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

export async function resetSignalState(): Promise<void> {
  contextCache.clear();
  await resetSignalDb();
}

export async function exportSignalState(): Promise<Record<string, string>> {
  return exportSignalStore();
}

export async function importSignalState(
  data: Record<string, string>
): Promise<void> {
  contextCache.clear();
  await importSignalStore(data);
}

export async function resetSignalSession(
  localUsername: string,
  remoteUsername: string,
  deviceId: number
): Promise<void> {
  const context = await getContext(localUsername);
  const address = new SignalProtocolAddress(remoteUsername, deviceId || 1);
  await context.store.deleteSession(address.toString());
}

export async function decryptSignalMessage(
  localUsername: string,
  remoteUsername: string,
  deviceId: number,
  ciphertext: string,
  nonce: string
): Promise<string> {
  const context = await getContext(localUsername);
  const address = new SignalProtocolAddress(remoteUsername, deviceId || 1);
  const cipher = new SessionCipher(context.storage, address);
  const typeRaw = nonce.split(":")[2] || "1";
  const parsedType = Number(typeRaw);
  const type = parsedType === 3 ? 3 : 1;
  let signalCiphertext = ciphertext;
  let fallback: FallbackCiphertext | undefined;
  if (nonce.startsWith("signal:v2:")) {
    const parsed = JSON.parse(ciphertext) as {
      v?: number;
      signal: string;
      fallback?: FallbackCiphertext;
    };
    if (
      parsed.v !== 2 ||
      typeof parsed.signal !== "string" ||
      !parsed.fallback ||
      typeof parsed.fallback.ephemeralPublicKey !== "string" ||
      typeof parsed.fallback.iv !== "string" ||
      typeof parsed.fallback.ciphertext !== "string"
    ) {
      throw new Error("Invalid encrypted message payload");
    }
    signalCiphertext = parsed.signal;
    fallback = parsed.fallback;
  }
  const binary = base64ToBinary(signalCiphertext);
  try {
    const plaintext =
      type === 3
        ? await cipher.decryptPreKeyWhisperMessage(binary, "binary")
        : await cipher.decryptWhisperMessage(binary, "binary");
    return decoder.decode(new Uint8Array(plaintext));
  } catch (error) {
    // Fallback to the other decrypt mode for mixed/legacy traffic.
    try {
      const alternatePlaintext =
        type === 3
          ? await cipher.decryptWhisperMessage(binary, "binary")
          : await cipher.decryptPreKeyWhisperMessage(binary, "binary");
      return decoder.decode(new Uint8Array(alternatePlaintext));
    } catch (fallbackError) {
      if (fallback) {
        return decryptFallback(context, fallback);
      }
      // A duplicate or out-of-order delivery must not destroy the ratchet
      // session. The caller keeps the ciphertext and can retry later.
      throw fallbackError;
    }
  }
}

export async function createSenderKeyDistribution(): Promise<{
  message: string;
}> {
  throw new Error("Sender keys are not supported in the browser build.");
}

export async function processSenderKeyDistribution(): Promise<void> {
  throw new Error("Sender keys are not supported in the browser build.");
}

export async function encryptGroupMessage(): Promise<{
  ciphertext: string;
  nonce: string;
}> {
  throw new Error("Group sender keys are not supported in the browser build.");
}

export async function decryptGroupMessage(): Promise<string> {
  throw new Error("Group sender keys are not supported in the browser build.");
}

export function hasSenderKeySent(): boolean {
  return false;
}

export function markSenderKeySent(): void {
  // no-op
}
