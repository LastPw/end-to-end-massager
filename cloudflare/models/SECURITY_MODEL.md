# Security Model (E2EE + XSS Focus)

## Threat model
- Adversary can read server storage, logs, and traffic metadata.
- Adversary can attempt client-side XSS to exfiltrate keys or plaintext.
- Adversary can attempt credential stuffing or brute force.

## What the server can see
- Account identifiers (username/phone)
- Metadata (timestamps, message sizes, device info)
- Ciphertext and nonces
- Group/channel membership and invite usage

## What the server can never see
- Plaintext messages
- Private keys
- Decrypted attachments

## Key generation and exchange
- Keys are generated client-side.
- Public bundles are published to the server.
- Clients establish Signal-style sessions per device.
- Messages are encrypted before upload.
- Fingerprints are computed locally; users see warnings on key changes.
- Users can mark a fingerprint as verified locally; verification is cleared if keys change.

## XSS impact on E2EE
- Any XSS can read keys and plaintext in the browser before encryption.
- XSS is the highest-risk class of bugs for an E2EE web client.

## XSS mitigations (defense-in-depth)
- No HTML injection APIs (`dangerouslySetInnerHTML`, `innerHTML`) in the client.
- All user content rendered as React text nodes (escaped by default).
- Strict input validation + normalization on the server.
- CSP with `script-src 'self'` and no inline scripts.
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

## Known limitations
- Web client uses localStorage for auth tokens (XSS risk).
- No sender keys for group chats in the web client.
- Key verification UX is limited.
- Encrypted message cache is stored locally (IndexedDB) for offline viewing.
- Optional decrypted media cache may store previews locally if enabled.
