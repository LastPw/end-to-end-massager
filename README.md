# Messager (Web, E2E)

Messager is a web-based encrypted messenger focused on secure transport and
privacy. The server only stores encrypted payloads and never sees plaintext.

License: MIT

## Features (v1)

- Phone-based signup + login (optional 2FA password)
- Polling-based message delivery
- WebSocket realtime delivery with polling fallback
- Cursor-based sync + history pagination
- End-to-end encryption in the browser
- Server stores ciphertext only
- Self-encrypted sender copy for local history after refresh
- Personal chats, groups, and channels
- Encrypted attachments (image/audio/video/file)
- Refined chat composer with upload queue and progress
- Telegram-style settings system with stacked pages and instant toggles
- Admin panel for moderation (ban, limits, delete users/channels)
- User profile logging (IP + device info stored in Postgres)
- Profile photo + bio + privacy controls
- Built-in rate limiting + request logging + security headers
- Refresh token rotation + session invalidation
- Key fingerprints with local verification + change warnings

## Tech stack

Backend:
- Node.js
- TypeScript
- Fastify
- Prisma ORM
- Postgres

Frontend:
- React
- Vite
- TypeScript

Crypto (client-side only):
- Signal-style sessions via libsignal-protocol
- X25519/Curve25519 for key agreement
- AES-GCM for message encryption

## Architecture (high level)

- Client generates keys locally and publishes a public bundle.
- Clients establish Signal sessions per device.
- Messages are encrypted in the browser before upload.
- Server stores and returns ciphertext only.

## Requirements

- Node.js 18+
- npm

## Project structure

- `server/` Fastify API
- `client/` React web app

## Setup and run

Install dependencies:

```bash
cd server
npm install
cd ../client
npm install
```

Run backend:

```bash
cd server
npm run dev
```

Database setup (Postgres):

```bash
cd server
set DATABASE_URL="postgresql://user:password@localhost:5432/messager"
npm run prisma:generate
npm run prisma:migrate
```

Production migrations (recommended):

```bash
cd server
npm run prisma:deploy
```

Rollback strategy: take a backup before migration and create a follow-up
migration to revert changes if needed.

Run frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## Encrypt-at-rest requirement

Server requires `APP_MASTER_KEY` to start. Example:

```bash
set APP_MASTER_KEY=your-strong-random-key-here
```

## Admin panel

Admin panel is accessed at `/#admin` (not shown in the regular UI). Set a
strong admin password immediately after first login.

## Security checklist (recommended)

- Use HTTPS and a real database (Postgres) before public release.
- Rotate admin credentials and store them in environment variables.
- Add CSRF protection if you switch to cookies.
- Add stronger password policy + account lockout after repeated failures.
- Use separate admin domain/app and enable 2FA.
- Store files in object storage (S3/R2) instead of base64 in JSON.
- Add server-side input validation (Zod/JSON schema) for all endpoints.

## Local testing tip

Open two browser profiles (normal + incognito) and sign up with two different
usernames to test encrypted chat between them.

## Security notes (MVP)

- Simple password auth (no MFA).
- Usernames are normalized to lowercase for consistent key storage.
- Private key is stored in browser storage (secure context required).
- No forward secrecy or key rotation.
- Key verification UX is limited to fingerprints (no QR yet).
- Attachments can use presigned object storage; inline base64 is only for small items.

## XSS Defense Checklist

- No `dangerouslySetInnerHTML` or HTML string rendering in the client.
- Strict server-side validation + normalization for all inputs.
- CSP enforced with `script-src 'self'` and no inline scripts.
- Security headers enabled (nosniff, no-referrer, permissions policy).
- Avoid CDN scripts; pin dependencies and review lockfiles.

## Auth storage tradeoffs

Auth tokens are stored in localStorage for simplicity. For higher security,
prefer HttpOnly, Secure, SameSite cookies and CSRF protections. This reduces
XSS token theft risk at the cost of more complex session handling.

See `SECURITY_MODEL.md` for the full threat model and XSS discussion.

## Uploads (large files)

For large attachments, configure object storage (S3/R2 compatible) so files
upload/download via presigned URLs. If storage is not configured, only small
inline attachments are supported.

## Operations and monitoring

- Metrics: `GET /api/admin/metrics` (admin token required).
- Log correlation: `X-Request-Id` is attached to every response and log line.
- Alerting (minimal): monitor error rate, decrypt-failed count, and request
  latency via the metrics endpoint and server logs.

## Backups

Run a local backup of the database:

```bash
cd server
npm run backup:db
```

## Testing and CI

- Server tests: `cd server && npm test`
- Client tests: `cd client && npm test`
- CI runs build + tests for both apps (see `.github/workflows/ci.yml`).

## Roadmap

- Strong authentication
- Key verification UI
- Message expiration / cleanup

## License

MIT
