<div align="center">

# 📱 Messager — End-to-End Encrypted Messenger

**A full-stack, privacy-first messaging platform with Signal-grade encryption, social features, and an ML-powered security gateway.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?logo=fastify&logoColor=fff)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=fff)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Overview

**Messager** is a privacy-first, end-to-end encrypted messaging platform. Messages are encrypted in the browser before ever reaching the server — the server stores only ciphertext and never sees plaintext content.

The project also includes a **Smart Security Gateway** — a research-grade reverse proxy with ML-assisted threat detection, behavioral analysis, and DDoS protection.

### ✨ Key Features

<details>
<summary><strong>📨 Messaging</strong></summary>

- **End-to-end encryption** — Signal Protocol (X25519 + AES-GCM) via `@privacyresearch/libsignal-protocol-typescript`
- **Personal chats, groups & channels** — Direct messaging, group conversations with roles, and broadcast channels
- **Real-time delivery** — WebSocket with automatic polling fallback
- **Cursor-based sync** — Efficient message history pagination
- **Encrypted attachments** — Images, audio, video, and files with presigned S3/R2 uploads
- **Scheduled messages** — Send messages at a future date/time
- **Message forwarding** — Forward messages between conversations
- **One-time messages** — Disappearing messages that self-destruct after reading
- **Link previews** — Automatic OG metadata extraction for shared URLs
- **Typing indicators** — Real-time typing status
- **Read receipts & delivery status** — Per-message delivery and read tracking
- **Message search** — Full-text search across messages with highlighted results
- **Message deletion** — Delete for self or for all members
- **Message reporting** — Report inappropriate content with moderation workflow
- **Quiet hours** — Per-conversation mute schedules
- **Chat folders, pinned chats & archiving** — Organize your conversations
- **Drafts** — Auto-save unsent messages per conversation
- **Quick replies** — Reusable message templates
- **Outbox** — Offline message queue with retry logic
</details>

<details>
<summary><strong>🔐 Security & Privacy</strong></summary>

- **Client-side only encryption** — Keys never leave the browser
- **Signal Protocol integration** — Double Ratchet algorithm for forward secrecy
- **Key fingerprint verification** — Verify identities via SHA-256 fingerprints with change warnings
- **ECDH P-256 key agreement** — With fallback public key support
- **Optional 2FA password** — Scrypt-hashed second factor
- **Session management** — Refresh token rotation, per-device sessions, device limit enforcement
- **Account lockout** — After 5 failed login attempts (5-minute cooldown)
- **Privacy controls** — Per-contact overrides for online status, last seen, profile photo, read receipts & typing indicators
- **Global lockdown mode** — Emergency kill switch to block all non-allowlisted conversations
- **Content Security Policy (CSP)** — Strict `script-src 'self'` with no inline scripts
- **Security headers** — HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Rate limiting** — Global and per-endpoint (Fastify rate-limit)
- **Admin panel** — Moderation tools for users, conversations, reports & system messages
</details>

<details>
<summary><strong>🌐 Social Network</strong></summary>

- **Social feed** — Share posts and reels with your followers
- **Stories** — 24-hour disappearing content
- **Likes, comments & saves** — Full social interaction model
- **Follow system** — Follow/unfollow with notifications
- **Public & private posts** — Control visibility per post with allowlisted users
- **Trending & latest sorting** — Discover popular content
- **Collections** — Curate and organize saved posts
- **Social insights** — View engagement analytics (likes, comments, saves, views)
- **Notifications** — Real-time social activity alerts
</details>

<details>
<summary><strong>🎨 User Experience</strong></summary>

- **Telegram-style settings** — Stacked page navigation with instant toggles
- **Dark/Light/System theme** — Automatic dark mode with accent color customization
- **4 accent color schemes** — Teal, Blue, Green, Amber
- **Font size scaling** — Small, Medium, Large
- **RTL support** — Full right-to-left layout for Farsi/Arabic
- **Multi-language ready** — Auto-detect, Farsi, English with timezone-aware timestamps
- **Phone-based signup & login** — International country code picker
- **Device management** — List, rename & revoke sessions per device
- **Profile management** — Avatar, bio, display name & privacy controls
- **Attachment upload queue** — Progress tracking for file uploads
- **Inline media gallery** — Browse chat media by conversation
- **Lightbox viewer** — Full-screen image viewing
- **Audio player** — In-chat audio playback with duration display
- **Live location sharing** — Real-time location updates with 15-minute expiry
- **Message caching** — Local IndexedDB cache for messages and media
- **Key backup/restore** — Export and import Signal key state
</details>

<details>
<summary><strong>🔬 Smart Security Gateway (Research)</strong></summary>

- **Reverse proxy** — Upstream IP hiding with behavior-based security
- **Behavioral fingerprinting** — Mouse, click, and keystroke analysis
- **ML decision engine** — Isolation Forest + Random Forest classifiers
- **Invisible JS challenges** — No CAPTCHA required for human verification
- **DDoS protection** — Adaptive guard with global & per-IP rate monitoring
- **WAF engine** — SQLi/XSS pattern detection with dashboard controls
- **Bot detection** — Scanner/distributed bot management with score headers
- **Geo/IP reputation** — Country-based allow/block policies
- **Honeypot traps** — Attacker detection via decoy endpoints
- **Admin dashboard** — Real-time stats, reports, and configuration
- **Domain verification** — TXT record validation for origin checks
- **Hourly PDF reports** — Automated security summaries
</details>

---

## 🏗️ Architecture

### High-Level Design

```
┌────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐   │
│  │  React   │  │  Signal   │  │   IndexedDB Cache       │   │
│  │   App    │  │ Protocol  │  │  (Messages + Media)     │   │
│  └────┬─────┘  └────┬─────┘  └─────────────────────────┘   │
│       │              │                                      │
│       └──────┬───────┘                                      │
│              │  Encrypted payload                           │
│              ▼                                               │
│    WebSocket / HTTP REST / Polling                           │
└──────────────┼──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                     Fastify Server                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Auth &   │  │ Message  │  │  Social  │  │   Admin     │ │
│  │ Sessions │  │  Routes  │  │  Routes  │  │   Panel     │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       └──────────────┼─────────────┼────────────────┘       │
│                      ▼             ▼                         │
│              ┌─────────────────────────────┐                 │
│              │   Prisma ORM + SQLite/Postgres               │
│              └─────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

(Optional) ┌─────────────────────────────────────────────────┐
            │   Smart Security Gateway (Python/FastAPI)       │
            │   Acting as a reverse proxy in front of server │
            │   - Behavioral analysis                         │
            │   - ML threat detection                         │
            │   - DDoS protection                             │
            │   - WAF + Bot management                        │
            └─────────────────────────────────────────────────┘
```

### Encryption Flow

```
1. Key Generation (in browser, once):
   ┌─────────────┐      ┌───────────────────┐      ┌────────────┐
   │ ECDH P-256  │ ───▶ │  Signal Identity  │ ───▶ │ Pre-Key   │
   │ Key Pair    │      │  Key Pair         │      │ Bundle    │
   └─────────────┘      └───────────────────┘      └─────┬──────┘
                                                         │
                                                         ▼
                                              ┌───────────────────┐
                                              │   Published to    │
                                              │   Server (public) │
                                              └───────────────────┘

2. Sending a Message:
   ┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌─────────────┐
   │ Fetch    │───▶│ Establish     │───▶│ Encrypt with │───▶│ Send to     │
   │ Recipient│    │ Signal Session│    │ AES-GCM (256)│    │ Server      │
   │ Key      │    │ (X3DH)        │    │              │    │ (ciphertext)│
   │ Bundle   │    │               │    │              │    │             │
   └──────────┘    └───────────────┘    └──────────────┘    └─────────────┘

3. Receiving a Message:
   ┌────────────┐    ┌──────────────┐    ┌──────────────────┐
   │ Poll/WS    │───▶│ Decrypt with │───▶│ Render plaintext │
   │ Ciphertext │    │ Double       │    │ (never persisted)│
   │ from Server│    │ Ratchet      │    │                  │
   └────────────┘    └──────────────┘    └──────────────────┘
```

---

## 🛠️ Tech Stack

### Backend (`server/`)

| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime |
| **TypeScript** | Type safety |
| **Fastify** | HTTP server with plugins |
| **Prisma ORM** | Database access & migrations |
| **SQLite / PostgreSQL** | Data storage |
| **@fastify/websocket** | Real-time messaging |
| **@fastify/rate-limit** | Rate limiting |
| **@fastify/helmet** | Security headers |
| **@fastify/multipart** | File uploads |
| **@aws-sdk/client-s3** | Object storage (S3/R2) |
| **Zod** | Input validation |
| **file-type** | MIME detection |

### Frontend (`client/`)

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **@privacyresearch/libsignal-protocol-typescript** | Signal Protocol (X3DH + Double Ratchet) |
| **Web Crypto API** | ECDH P-256 key agreement & AES-GCM |
| **WebSocket API** | Real-time communication |
| **IndexedDB** | Local message caching |

### Security Gateway (`cloudflare/`)

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Runtime |
| **FastAPI** | Web framework |
| **scikit-learn** | ML models (Isolation Forest, Random Forest) |
| **httpx** | Async HTTP client |
| **Jinja2** | Template rendering |
| **ReportLab** | PDF report generation |
| **dnspython** | DNS verification |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+ (for the security gateway)
- SQLite (default) or PostgreSQL

### 1. Clone & Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# (Optional) Security Gateway
cd ../cloudflare
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Server (required)
set APP_MASTER_KEY=your-strong-random-key-here

# Server (optional - defaults to SQLite)
set DATABASE_URL=postgresql://user:password@localhost:5432/messager
```

### 3. Database Setup

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run the Application

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. (Optional) Run the Security Gateway

```bash
cd cloudflare

# Train ML models
python ml/train.py

# Start gateway (pointing to your server)
set UPSTREAM_BASE_URL=http://localhost:3001
uvicorn app.main:app --reload --port 8000
```

Visit **http://localhost:8000** to access the application through the gateway.

---

## 🧪 Testing

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test

# CI (both apps)
# See .github/workflows/ci.yml
```

## 📂 Project Structure

```
messager/
├── client/                    # React frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Main application component
│   │   ├── api.ts             # API client (all HTTP endpoints)
│   │   ├── crypto.ts          # ECDH + AES-GCM crypto primitives
│   │   ├── signal.ts          # Signal Protocol integration
│   │   ├── signalStore.ts     # IndexedDB-backed key/session store
│   │   ├── messageCache.ts    # Local message/media cache
│   │   ├── messageUtils.ts    # Message merge & utility functions
│   │   ├── countries.ts       # Country codes for phone input
│   │   └── styles.css         # Application styles
│   ├── tests/                 # Client tests
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                    # Fastify backend
│   ├── src/
│   │   ├── server.ts          # Server entry point & all routes
│   │   ├── db.ts              # Database access layer (Prisma)
│   │   ├── validation.ts      # Zod schemas for input validation
│   │   ├── uploads.ts         # File upload handling (S3/R2)
│   │   ├── storage.ts         # Storage abstraction
│   │   └── prisma.ts          # Prisma client initialization
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── tests/                 # Server tests
│   └── tsconfig.json
├── cloudflare/                # Smart Security Gateway (research)
│   ├── app/
│   │   ├── main.py            # FastAPI application & routes
│   │   ├── config.py          # Environment configuration
│   │   ├── security.py        # Security policy engine
│   │   ├── ddos.py            # Adaptive DDoS guard
│   │   ├── ratelimit.py       # Sliding window rate limiter
│   │   ├── behavior.py        # Behavioral fingerprinting
│   │   ├── domains.py         # Domain verification
│   │   ├── metrics.py         # Real-time metrics collection
│   │   ├── reporting.py       # PDF report generation
│   │   ├── session_state.py   # Session state management
│   │   ├── storage.py         # Data persistence
│   │   ├── templates/         # Jinja2 HTML templates
│   │   └── static/            # Static assets (behavior.js)
│   ├── ml/                    # Machine learning pipeline
│   │   ├── train.py           # Model training
│   │   ├── generate_dataset.py  # Synthetic data generation
│   │   ├── evaluate.py        # Model evaluation
│   │   └── report.py          # Evaluation report generation
│   ├── models/                # Trained model files & docs
│   ├── docs/                  # Documentation
│   ├── scripts/               # Traffic/behavior simulation
│   └── requirements.txt
├── .github/workflows/         # CI configuration
├── install.sh                 # Automated setup script
├── FAIR_USE.md                # Fair use policy
├── PRIVACY.md                 # Privacy policy
├── TERMS.md                   # Terms of service
└── README.md                  # This file
```

---

## 📡 API Reference

The server exposes a RESTful API under `/api/` and WebSocket at `/ws`.

### Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Register with phone, username & key bundle |
| `/api/auth/login` | POST | Login with phone & optional 2FA |
| `/api/auth/refresh` | POST | Rotate access & refresh tokens |
| `/api/auth/2fa/enable` | POST | Set a 2FA password |
| `/api/auth/2fa/disable` | POST | Remove 2FA password |
| `/api/auth/ws-ticket` | POST | Get WebSocket connection ticket |

### Conversations

| Endpoint | Method | Description |
|---|---|---|
| `/api/conversations` | GET | List user's conversations |
| `/api/conversations` | POST | Create direct/group/channel |
| `/api/conversations/:id/roster` | GET | Get conversation roster |
| `/api/conversations/:id/members` | GET | List members |
| `/api/conversations/:id/members/add` | POST | Add member |
| `/api/conversations/:id/members/remove` | POST | Remove member |
| `/api/conversations/:id/role` | POST | Update member role |
| `/api/conversations/:id/invites` | GET/POST | Manage invite links |
| `/api/conversations/:id/settings` | GET/POST | Forward/quiet hours settings |
| `/api/invites/redeem` | POST | Join via invite link |

### Messages

| Endpoint | Method | Description |
|---|---|---|
| `/api/messages/send` | POST | Send encrypted messages |
| `/api/messages/schedule` | POST | Schedule a message |
| `/api/messages/poll` | GET | Poll for new messages |
| `/api/messages/sent` | GET | Poll sent message status |
| `/api/messages/history` | GET | Paginated history |
| `/api/messages/read` | POST | Mark conversation as read |
| `/api/messages/delete` | POST | Delete messages |

### Keys

| Endpoint | Method | Description |
|---|---|---|
| `/api/keys/publish` | POST | Publish Signal key bundle |
| `/api/keys/bundle/:username` | GET | Fetch user's key bundle |

### Social

| Endpoint | Method | Description |
|---|---|---|
| `/api/social/feed` | GET | Social feed (posts/reels) |
| `/api/social/posts` | POST | Create a post/reel/story |
| `/api/social/stories` | GET | Active stories |
| `/api/social/posts/:id/like` | POST | Toggle like |
| `/api/social/posts/:id/save` | POST | Toggle save |
| `/api/social/posts/:id/view` | POST | Record a view |
| `/api/social/posts/:id/comments` | GET/POST | Post comments |
| `/api/social/follow` | POST | Follow a user |
| `/api/social/unfollow` | POST | Unfollow a user |
| `/api/social/follows` | GET | List follows/followers |
| `/api/social/notifications` | GET | Get notifications |
| `/api/social/insights` | GET | Engagement analytics |

### Profile & Devices

| Endpoint | Method | Description |
|---|---|---|
| `/api/profile` | GET/POST | View/update profile |
| `/api/privacy/contact` | POST | Per-contact privacy override |
| `/api/users/:username/status` | GET | Online/last seen status |
| `/api/users/:username/public-key` | GET | Public key |
| `/api/devices` | GET | List devices |
| `/api/devices/:id/logout` | POST | Revoke device session |
| `/api/devices/logout-all` | POST | Revoke all sessions |

### Admin

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/admins` | GET/POST | Manage admin accounts |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/:id` | GET | User details |
| `/api/admin/conversations` | GET | List all conversations |
| `/api/admin/reports` | GET/POST | Manage reports |
| `/api/admin/system-message` | POST | Send system-wide message |
| `/api/admin/lockdown` | GET/POST | Global lockdown mode |
| `/api/admin/metrics` | GET | Server metrics |
| `/api/admin/uploads/direct` | POST | Direct file upload |

---

## 👨‍💻 Admin Panel

Access the admin panel by navigating to `/#admin` in the application (not shown in the regular UI).

### Features

- **User management** — Ban/unban, flag accounts, view profiles & IP logs
- **Conversation management** — View, delete, and moderate conversations
- **Report queue** — Review and act on user reports (porn, dangerous links, threats, abuse)
- **System messages** — Broadcast messages to all users
- **Global lockdown** — Emergency mode to restrict platform access to allowlisted conversations
- **Admin accounts** — Role-based access (super/standard) with granular permissions
- **Metrics** — Server request/error/latency monitoring

### Default Admin Credentials

The first admin user is auto-created on first request. **Set a strong password immediately.**

---

## 🗄️ Database Schema

The database uses **SQLite by default** (production-ready with PostgreSQL). Key models:

| Table | Purpose |
|---|---|
| `users` | User accounts with key material & privacy settings |
| `sessions` | Auth sessions with access/refresh token rotation |
| `conversations` | Direct, group, and channel conversations |
| `memberships` | User-conversation membership with roles |
| `messages` | Encrypted messages with delivery/read/deletion status |
| `scheduled_messages` | Future-dated message batches |
| `user_key_bundles` | Signal Protocol key bundles per device |
| `social_posts` | Posts, reels, and stories |
| `social_likes/saves/views/comments/follows` | Social interactions |
| `social_notifications` | Activity notifications |
| `reports` | Content moderation reports |
| `admin_users` | Admin panel accounts |
| `app_settings` | Key-value application settings |
| `user_profiles` | IP/device login history |
| `uploaded_files` | File upload registry |

---

## ☁️ Security Gateway Setup

The Smart Security Gateway is a **separate research prototype** that acts as a reverse proxy in front of your application. See the [full gateway documentation](cloudflare/README.md) for details.

### Quick Setup

```bash
cd cloudflare

# Train ML models
python ml/train.py

# Generate evaluation dataset & report
python ml/generate_dataset.py
python ml/evaluate.py
python ml/report.py

# Start example upstream (port 8080)
uvicorn examples.upstream:app --port 8080

# Start gateway (port 8000)
set UPSTREAM_BASE_URL=http://localhost:8080
uvicorn app.main:app --reload --port 8000
```

### Traffic Simulation

```bash
# Human-like traffic
python scripts/traffic_sim.py --scenario human

# Bot-like traffic
python scripts/traffic_sim.py --scenario bot

# Reconnaissance simulation
python scripts/traffic_sim.py --scenario recon

# Brute force simulation
python scripts/traffic_sim.py --scenario bruteforce
```

---

## 📊 Operations & Monitoring

### Logging

- **Structured JSON logs** — All requests logged with `X-Request-Id` correlation
- **Log levels** — Configurable via Fastify logger settings

### Metrics Endpoint

```
GET /api/admin/metrics
```

Returns:
- Total requests
- Error count
- Decrypt failure count
- Average latency (ms)

### Backup

```bash
cd server
npm run backup:db
```

### Database Migrations

```bash
# Development (auto-generate)
npm run prisma:migrate

# Production (apply pending)
npm run prisma:deploy
```

### Encryption at Rest

Set `APP_MASTER_KEY` environment variable to a strong random key. The server will refuse to start without it.

### Object Storage

For large file uploads, configure S3/R2-compatible storage:

| Variable | Description |
|---|---|
| `S3_ENDPOINT` | S3-compatible endpoint URL |
| `S3_REGION` | Region (e.g., `auto` for R2) |
| `S3_BUCKET` | Bucket name |
| `S3_ACCESS_KEY_ID` | Access key |
| `S3_SECRET_ACCESS_KEY` | Secret key |
| `S3_PUBLIC_BASE` | Public base URL for media |

---

## 🔒 Security Model

### Encryption

| Primitive | Algorithm |
|---|---|
| Key Agreement | ECDH P-256 (Web Crypto API) |
| Message Encryption | AES-256-GCM |
| Signal Protocol | X3DH + Double Ratchet (`@privacyresearch/libsignal-protocol-typescript`) |
| Session Establishment | PreKey bundles with one-time prekeys |
| Password Hashing | scrypt (32-byte salt) |
| Key Fingerprinting | SHA-256 |

### Threat Mitigation

| Threat | Mitigation |
|---|---|
| Server-side data breach | Server stores only ciphertext; keys never leave client |
| Man-in-the-middle | Key fingerprints with local verification & change warnings |
| Session hijacking | Token rotation, short-lived access tokens, device limits |
| Brute force login | Account lockout after 5 attempts, rate limiting |
| XSS | CSP `script-src 'self'`, no `dangerouslySetInnerHTML` |
| CSRF | Credentials via `Authorization` header, not cookies |
| DDoS | Rate limiting, optional security gateway with adaptive DDoS guard |

### Security Checklist (Production)

- [ ] Use **HTTPS** in production (required for Web Crypto API)
- [ ] Use **PostgreSQL** instead of SQLite
- [ ] Set strong **`APP_MASTER_KEY`**
- [ ] Rotate admin credentials
- [ ] Enable **HSTS** (`APP_HSTS=1`)
- [ ] Configure **S3/R2 object storage** for attachments
- [ ] Add **CSRF protection** if using cookie-based auth
- [ ] Enable **2FA** for all admin accounts
- [ ] Use **separate admin domain** with additional access controls
- [ ] Configure **database backups**
- [ ] Review **X-Forwarded-For** trust configuration

---

## 🌐 Environment Variables

### Server

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | `file:./data/messager.db` | Database connection string |
| `APP_MASTER_KEY` | *(required)* | Encryption-at-rest key |
| `APP_HSTS` | `0` | Enable HSTS (`1`) |
| `APP_CONNECT_SRC` | — | Additional CSP connect-src origins |
| `S3_ENDPOINT` | — | S3-compatible endpoint |
| `S3_REGION` | — | S3 region |
| `S3_BUCKET` | — | S3 bucket |
| `S3_ACCESS_KEY_ID` | — | S3 access key |
| `S3_SECRET_ACCESS_KEY` | — | S3 secret key |
| `S3_PUBLIC_BASE` | — | Public media URL base |
| `SOCIAL_MEDIA_HOSTS` | — | Allowed external media hosts |
| `NODE_ENV` | — | `production` enables secure cookies |

### Client

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE` | `http://localhost:3001` | API base URL (empty = same origin) |

### Security Gateway

| Variable | Default | Description |
|---|---|---|
| `UPSTREAM_BASE_URL` | `http://localhost:8080` | Upstream server |
| `SESSION_COOKIE_NAME` | `sgw_session` | Session cookie name |
| `CHALLENGE_SECRET` | `change-me` | Challenge signing key |
| `CHALLENGE_TTL_SECONDS` | `120` | Challenge validity |
| `MAX_REQ_PER_MINUTE` | `120` | Per-session rate limit |
| `MAX_REQ_PER_MINUTE_IP` | `300` | Per-IP rate limit |
| `UNDER_ATTACK_MODE` | `0` | Enable JS challenge mode |
| `ALLOWLIST_IPS`/`BLOCKLIST_IPS` | — | IP access control lists |
| `DDOS_GLOBAL_RPM` | `3000` | Global DDoS threshold |
| `DDOS_IP_RPM` | `600` | Per-IP DDoS threshold |
| `MODEL_DIR` | `models` | ML model directory |
| `DATA_DB_PATH` | `data/behavior.db` | Behavior data store |

---

## 🗺️ Roadmap

- [ ] **Strong authentication** — WebAuthn/passkey support
- [ ] **Key verification UI** — QR code scanning for key verification
- [ ] **Message expiration** — Per-message auto-delete timers
- [ ] **Groups** — Sender keys for efficient group encryption
- [ ] **Voice & video calls** — Full WebRTC integration
- [ ] **Push notifications** — Web push API support
- [ ] **End-to-end encrypted backups** — Cloud key backup with recovery phrase

---

## 📄 License

**MIT** — See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. Tests pass (`npm test` in both `client/` and `server/`)
2. Code follows existing conventions
3. Security-sensitive changes include threat model considerations

---

<div align="center">
  <sub>Built with ❤️ for privacy and security research.</sub>
</div>
