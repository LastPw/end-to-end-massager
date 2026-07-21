import { describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";
import {
  decryptMessage,
  deriveSharedKey,
  encryptMessage,
  generateKeyPair,
  importPrivateKey,
  importPublicKey
} from "../src/crypto";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown as Crypto;
}

if (!globalThis.atob) {
  globalThis.atob = (input: string) =>
    Buffer.from(input, "base64").toString("binary");
}

if (!globalThis.btoa) {
  globalThis.btoa = (input: string) =>
    Buffer.from(input, "binary").toString("base64");
}

describe("crypto utilities", () => {
  it("roundtrips encryption/decryption", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const alicePriv = await importPrivateKey(alice.privateKey);
    const bobPub = await importPublicKey(bob.publicKey);
    const shared = await deriveSharedKey(alicePriv, bobPub);
    const { ciphertext, nonce } = await encryptMessage(shared, "hello");
    const plaintext = await decryptMessage(shared, ciphertext, nonce);
    expect(plaintext).toBe("hello");
  });
});
