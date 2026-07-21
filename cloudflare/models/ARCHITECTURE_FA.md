# راهنمای معماری و بخش‌های مهم پروژه Messager

تاریخ بررسی: ۶ ژوئن ۲۰۲۶

این سند بر اساس اسکن کد منبع پروژه تهیه شده است. تمرکز اصلی روی فایل‌های `src`، تنظیمات build، مدل داده، تست‌ها و زیرسامانه امنیتی `cloudflare` بوده است. پوشه‌های خروجی مانند `dist` مرجع اصلی تحلیل نیستند، چون از روی کد TypeScript تولید می‌شوند.

## خلاصه اجرایی

این مخزن در عمل شامل دو محصول نسبتاً مستقل است:

1. **پیام‌رسان وب Messager**
   - کلاینت React و TypeScript
   - API سرور Fastify و TypeScript
   - SQLite با Prisma
   - رمزنگاری پیام در مرورگر با پیاده‌سازی Signal-style
   - WebSocket برای تحویل بلادرنگ و polling به‌عنوان fallback

2. **Smart Security Gateway**
   - reverse proxy نوشته‌شده با Python و FastAPI
   - WAF، rate limit، تشخیص اسکنر، challenge و محافظت DDoS
   - تحلیل رفتار کاربر و امتیاز ریسک با مدل‌های scikit-learn
   - SQLite مستقل برای رخدادها و تنظیمات امنیتی

پیام‌رسان از نظر قابلیت‌ها گسترده است: چت مستقیم، گروه، کانال، فایل، تماس WebRTC، زمان‌بندی پیام، پروفایل، privacy، شبکه اجتماعی، پنل مدیریت و گزارش تخلف. در مقابل، ساختار کد آن هنوز ماژولار نشده و بخش بزرگی از منطق در چند فایل بسیار بزرگ متمرکز است.

## زبان‌ها و فناوری‌ها

### کلاینت

- TypeScript و TSX
- React 18
- Vite
- CSS معمولی
- IndexedDB و LocalStorage
- Web Crypto API
- `@privacyresearch/libsignal-protocol-typescript`
- WebSocket و WebRTC
- Vitest برای تست

### سرور

- TypeScript روی Node.js
- Fastify
- Zod برای validation
- Prisma ORM
- SQLite
- AWS SDK برای S3/R2-compatible storage
- ClamAV اختیاری برای اسکن فایل
- WebSocket
- Node test runner

### Security Gateway

- Python
- FastAPI و Uvicorn
- HTTPX برای reverse proxy
- SQLite داخلی
- NumPy و scikit-learn
- Jinja2
- ReportLab برای گزارش PDF
- dnspython برای تأیید دامنه

## نمای کلی معماری

```text
Browser
  |
  | HTTPS / WebSocket
  v
[اختیاری] Smart Security Gateway :8000
  |  WAF, Bot Detection, Rate Limit, Challenge, DDoS
  v
Fastify API :3001
  |-- Auth / Sessions / Admin
  |-- Conversations / Messages / Social
  |-- WebSocket signaling and delivery
  |-- Prisma
  |     `-- SQLite (server/prisma/dev.db)
  `-- S3/R2 + optional ClamAV

Browser local storage
  |-- LocalStorage: tokenها، تنظیمات و state رابط
  |-- IndexedDB messager-signal: کلیدها و sessionهای Signal
  `-- IndexedDB messager-cache: ciphertext و media cache
```

## ساختار اصلی مخزن

```text
client/
  src/
    App.tsx            رابط و بیشتر منطق کلاینت
    api.ts             تمام فراخوانی‌های HTTP
    signal.ts          مدیریت کلید و sessionهای Signal
    signalStore.ts     persistence مربوط به Signal در IndexedDB
    crypto.ts          رمزنگاری قدیمی‌تر ECDH P-256 + AES-GCM
    messageCache.ts    cache محلی پیام و رسانه
    messageUtils.ts    ادغام و مرتب‌سازی پیام‌ها
    styles.css         تمام styleهای برنامه

server/
  src/
    server.ts          bootstrap، middleware و تقریباً تمام routeها
    db.ts              repository/data-access و تبدیل مدل‌ها
    prisma.ts          PrismaClient singleton
    validation.ts      schemaهای مشترک Zod
    uploads.ts         S3/R2، presigned URL و ClamAV
    storage.ts         فایل JSON رمز‌شده؛ در مسیر اصلی DB کم‌استفاده است
  prisma/
    schema.prisma      مدل کامل داده
    dev.db             دیتابیس SQLite توسعه

cloudflare/
  app/
    main.py            FastAPI، پنل‌ها و reverse proxy
    security.py        موتور تصمیم WAF/Bot/Challenge
    behavior.py        استخراج featureهای رفتاری
    ddos.py            تشخیص rate و spike
    storage.py         SQLite subsystem
    domains.py         تأیید DNS دامنه
  ml/                  آموزش، ارزیابی و dataset مصنوعی
  scripts/             شبیه‌سازی ترافیک و رفتار
```

## معماری کلاینت

نقطه ورود `client/src/main.tsx` است و فقط کامپوننت `App` را mount می‌کند. تقریباً کل برنامه داخل `App.tsx` قرار دارد.

### مسئولیت‌های `App.tsx`

- ثبت‌نام، ورود، refresh token و logout
- مدیریت پروفایل و privacy
- فهرست گفتگوها و پیام‌ها
- رمزگذاری و رمزگشایی Signal
- polling و اتصال WebSocket
- outbox، retry و پیام optimistic
- upload و attachment
- تماس صوتی/تصویری WebRTC
- گروه، کانال، invite و role
- social feed، story، reel، follow، comment و insight
- تنظیمات، cache، key backup و fingerprint verification
- پنل کامل مدیریت

این فایل حدود **۱۰۵۰۰ خط** دارد. این تمرکز مسئولیت، مهم‌ترین بدهی معماری کلاینت است. هر تغییر کوچک می‌تواند روی effectها و stateهای نامرتبط اثر جانبی بگذارد.

### لایه API

`client/src/api.ts` یک wrapper نسبتاً ساده روی `fetch` است:

- access token و refresh token را در متغیرهای module نگه می‌دارد.
- headerهای user و admin را می‌سازد.
- برای هر endpoint یک function export می‌کند.
- retry یا refresh خودکار عمومی در یک interceptor مرکزی ندارد؛ orchestration بیشتر در `App.tsx` انجام می‌شود.

### ذخیره‌سازی مرورگر

سه نوع state محلی وجود دارد:

- **LocalStorage:** access token، refresh token، username، theme، تنظیمات، draft، outbox، pinned/starred و stateهای UI.
- **IndexedDB `messager-signal`:** identity key، pre-key، signed pre-key، identityهای remote و session recordها.
- **IndexedDB `messager-cache`:** ciphertext پیام‌ها و اطلاعات media برای استفاده آفلاین.

ذخیره token در LocalStorage ساده است، اما در صورت XSS قابل سرقت است. خود `SECURITY_MODEL.md` نیز این محدودیت را پذیرفته است.

## معماری رمزنگاری پیام

در پروژه دو مسیر رمزنگاری دیده می‌شود:

### مسیر فعلی: Signal-style

فایل اصلی `client/src/signal.ts` است:

1. identity key و registration ID در مرورگر ساخته می‌شود.
2. signed pre-key و ۳۰ one-time pre-key تولید می‌شود.
3. public bundle با `/api/keys/publish` روی سرور قرار می‌گیرد.
4. فرستنده bundle دستگاه مقصد را دریافت می‌کند.
5. `SessionBuilder` یک session محلی ایجاد می‌کند.
6. `SessionCipher` متن را encrypt می‌کند.
7. سرور فقط `ciphertext` و یک marker مانند `signal:v1:<type>` را ذخیره می‌کند.
8. گیرنده با session محلی پیام را decrypt می‌کند.

برای هر دستگاه مقصد یک payload جدا ساخته می‌شود. یک نسخه self-encrypted نیز می‌تواند برای history فرستنده وجود داشته باشد.

### مسیر قدیمی یا کمکی: P-256

`client/src/crypto.ts` شامل ECDH روی P-256 و AES-GCM است. تست `crypto.test.ts` همین مسیر را تست می‌کند. این فایل با `CRYPTO.md` هم‌راستاست، ولی مسیر اصلی پیام‌رسان فعلی بر `signal.ts` متکی است.

در نتیجه مستندات رمزنگاری باید به‌روزرسانی شوند تا دقیقاً مشخص شود `crypto.ts` legacy، fallback یا صرفاً utility تستی است.

### محدودیت‌های مهم رمزنگاری

- sender key برای گروه‌ها پیاده‌سازی نشده و functionهای آن صریحاً خطا می‌دهند.
- گروه‌ها عملاً پیام را برای اعضا/دستگاه‌ها به‌صورت جداگانه encrypt می‌کنند.
- امنیت E2EE به امنیت JavaScript صفحه وابسته است؛ XSS می‌تواند plaintext و کلیدها را قبل از رمزنگاری بخواند.
- سرور metadata شامل اعضا، زمان، اندازه، دستگاه، IP و الگوی ارتباط را می‌بیند.
- پیام سیستمی admin با marker به نام `plain:system` ذخیره می‌شود و E2EE واقعی ندارد.

## جریان ارسال و دریافت پیام

### ارسال

1. کاربر متن یا attachment را در کلاینت آماده می‌کند.
2. کلاینت roster و key bundle دستگاه‌های مقصد را می‌گیرد.
3. برای هر مقصد یک Signal session ایجاد یا بازیابی می‌شود.
4. payload در مرورگر encrypt می‌شود.
5. مجموعه payloadها به `/api/messages/send` فرستاده می‌شود.
6. سرور membership، channel role، quiet hours و forwarding policy را بررسی می‌کند.
7. هر ciphertext به‌عنوان یک row در جدول `messages` ثبت می‌شود.
8. سرور با WebSocket به دستگاه مقصد event می‌فرستد.
9. در صورت نبود WebSocket، کلاینت با `/api/messages/poll` پیام را می‌گیرد.

### دریافت

1. پیام از WebSocket یا polling دریافت می‌شود.
2. ciphertext در IndexedDB cache می‌شود.
3. کلاینت با session فرستنده decrypt می‌کند.
4. در شکست decrypt، حالت جایگزین type امتحان می‌شود.
5. در شکست دوباره، session reset و یک بار repair انجام می‌شود.
6. خطای decrypt به endpoint متریک گزارش می‌شود.

### history و status

- history با cursor زمانی و endpoint `/api/messages/history` خوانده می‌شود.
- وضعیت delivered/read در DB نگه‌داری می‌شود.
- sender از `/api/messages/sent` statusها را poll می‌کند.
- `messageUtils.ts` پیام optimistic محلی را با نسخه نهایی سرور merge می‌کند.

## معماری سرور

`server/src/server.ts` حدود **۴۱۰۰ خط** دارد و هم‌زمان مسئول موارد زیر است:

- ساخت Fastify
- middleware و security header
- validation routeها
- authentication و authorization
- WebSocket registry
- تمام endpointهای user، message، social و admin
- call signaling
- scheduled-message worker
- metrics و logging

`server/src/db.ts` نیز حدود **۱۸۰۰ خط** است و تقریباً تمام queryها و تبدیل مدل‌ها را در یک data-access module نگه می‌دارد.

این طراحی برای MVP قابل اجراست، ولی برای توسعه بعدی بهتر است routeها بر اساس domain جدا شوند:

```text
modules/
  auth/
  users/
  conversations/
  messages/
  calls/
  social/
  admin/
  uploads/
```

### authentication

- access token تصادفی با عمر ۱۵ دقیقه
- refresh token با عمر ۷ روز
- refresh token در DB به‌صورت hash ذخیره می‌شود.
- refresh rotation انجام می‌شود.
- session به device ID متصل است.
- حداکثر سه دستگاه در نظر گرفته شده است.
- password با `scrypt` و salt تصادفی hash می‌شود.
- مقایسه hash با `timingSafeEqual` انجام می‌شود.
- پس از پنج تلاش ناموفق، lockout پنج دقیقه‌ای فعال می‌شود.

نکته: ورود بدون password برای حسابی که 2FA ندارد مجاز است. بنابراین شماره تلفن در این نسخه نقش شناسه ورود را دارد، نه اثبات مالکیت شماره؛ OTP یا تأیید واقعی تلفن وجود ندارد.

### validation

`server/src/validation.ts` schemaهای Zod مشترک برای username، phone، filename، device ID، upload key، URL و اندازه payload دارد. routeها عموماً body/query/params را با schemaهای strict parse می‌کنند.

### realtime

- WebSocket endpoint در `/ws` است.
- token در query string ارسال می‌شود.
- socketها بر اساس user ID و device ID در memory نگه‌داری می‌شوند.
- با restart سرور، state اتصال، typing و call از بین می‌رود.
- این state برای چند instance مشترک نیست؛ scale افقی به Redis/pub-sub نیاز دارد.

### فایل‌ها

`uploads.ts` دو مسیر دارد:

- presigned PUT/GET برای S3 یا R2
- direct upload با temporary file، تشخیص MIME و ClamAV اختیاری

SVG به `application/octet-stream` تبدیل می‌شود. filename sanitize می‌شود و object key تصادفی است.

## مدل داده

Prisma فعلی از **SQLite** استفاده می‌کند، نه Postgres. مهم‌ترین مدل‌ها:

- `users`: هویت، تنظیمات حساب، privacy و public key قدیمی
- `sessions`: access/refresh session و اطلاعات دستگاه
- `conversations`: direct/group/channel و policyها
- `memberships`: role و permission اعضا
- `messages`: یک ciphertext برای یک recipient/device
- `scheduled_messages`: batch رمز‌شده برای ارسال آینده
- `user_key_bundles`: identity key، signed pre-key و one-time pre-key
- `invites`: لینک دعوت با expiry و max use
- `reports`: گزارش تخلف
- `blocked_events`: ثبت موارد جلوگیری‌شده مانند quiet hours
- `social_*`: post، like، save، view، comment، follow و notification
- `admin_users` و `admin_sessions`: مدیریت RBAC
- `app_settings`: تنظیمات سراسری مانند lockdown
- `user_profiles`: IP، user agent، platform و history دستگاه

زمان‌ها در Prisma عمدتاً `Int` هستند و در `db.ts` بین millisecond برنامه و second دیتابیس تبدیل می‌شوند. این convention باید در تمام queryهای جدید رعایت شود.

## شبکه اجتماعی و قابلیت‌های جانبی

پیام‌رسان فقط chat نیست. schema و routeها قابلیت‌های زیر را هم دارند:

- post، reel و story
- visibility عمومی/خصوصی و لیست کاربران مجاز
- like، save، comment و view
- follow و friend تشخیص‌داده‌شده از follow دوطرفه
- notification
- insight و trending score
- زمان انتشار و انقضا

تماس صوتی و تصویری با WebRTC در کلاینت انجام می‌شود و سرور فقط signaling eventهای offer/answer/ICE/end را موقتاً در memory نگه می‌دارد.

## پنل مدیریت

پنل React از hash برابر `#admin` باز می‌شود. سرور RBAC با permissionهای زیر دارد:

- `manage_users`
- `manage_conversations`
- `manage_reports`
- `manage_system`
- `manage_settings`
- `manage_social`
- `manage_admins`

قابلیت‌ها شامل ban/restrict، حذف user و conversation، reset password، مدیریت adminها، system message، global lockdown، گزارش‌ها، blocked events و metrics است.

### ریسک فوری admin

در `server/src/db.ts` یک admin پیش‌فرض با username برابر `admin` و password برابر `12345678` ساخته می‌شود. این credential باید قبل از هر deployment عمومی حذف یا از environment دریافت شود. اتکا به تغییر دستی بعد از اولین login ریسک بالایی دارد.

## Smart Security Gateway

پوشه `cloudflare` ارتباطی با Cloudflare SDK ندارد؛ یک reverse proxy پژوهشی مستقل است.

### جریان درخواست

1. درخواست وارد FastAPI می‌شود.
2. IP، session cookie، path، header و body بررسی می‌شوند.
3. WAF روی URI و body pattern matching انجام می‌دهد.
4. rate limit session/IP/path بررسی می‌شود.
5. DDoS guard نرخ global و per-IP و spike را بررسی می‌کند.
6. featureهای رفتاری از SQLite خوانده می‌شوند.
7. Isolation Forest، Random Forest و classifier نیمه‌نظارتی risk می‌سازند.
8. نتیجه یکی از `allow`، `challenge`، `trap` یا `block` است.
9. درخواست مجاز با HTTPX به upstream proxy می‌شود.
10. در پاسخ HTML، script رفتار کاربر inject می‌شود.

### featureهای رفتاری

- میانگین و انحراف سرعت mouse
- فاصله click و key
- رفتار scroll
- تعداد و تنوع navigation
- dwell time
- webdriver flag
- تغییر device signature
- تغییر fingerprint
- mismatch محتوایی

### ذخیره‌سازی gateway

SQLite مستقل شامل این داده‌هاست:

- behavior events
- security decisions
- domain verification
- scanner/security reports
- WAF rules
- IP reputation
- geo policy
- bot thresholds

### محدودیت‌های gateway

- admin dashboard و APIهای مدیریتی gateway authentication مشخصی ندارند.
- session cookie در کد `secure=True` ندارد.
- stateهای temp block، fingerprint و DDoS در memory هستند.
- مدل‌ها با داده مصنوعی آموزش می‌بینند؛ برای production باید با داده واقعی، drift monitoring و false-positive analysis اعتبارسنجی شوند.
- WAF مبتنی بر regex جایگزین WAF production-grade نیست.

## کنترل‌های امنیتی مثبت

- CSP و headerهای امنیتی در Fastify
- Helmet
- rate limit سراسری و route-specific
- Zod validation با schemaهای strict
- `scrypt` برای password
- refresh token rotation
- hash شدن refresh token
- session invalidation
- account lockout
- بررسی membership و role روی عملیات گفتگو
- ciphertext-only برای پیام‌های عادی
- presigned object storage
- MIME detection و ClamAV اختیاری
- محدودسازی URL و SSRF defense در link preview
- logging با request ID
- fingerprint و key-change warning در کلاینت

## ریسک‌ها و بدهی‌های فنی مهم

### اولویت خیلی بالا

1. **credential پیش‌فرض admin**
   - `admin / 12345678` داخل کد است.

2. **عدم احراز هویت پنل Security Gateway**
   - endpointهای تنظیم WAF، IP reputation، geo و bot policy عمومی به نظر می‌رسند.

3. **توکن در LocalStorage**
   - هر XSS می‌تواند access و refresh token را بردارد.

4. **عدم تأیید مالکیت شماره تلفن**
   - حساب بدون 2FA فقط با شماره وارد می‌شود و OTP وجود ندارد.

5. **CORS باز**
   - Fastify با `origin: true` هر origin را reflect می‌کند.

### اولویت بالا

1. `App.tsx`، `server.ts` و `db.ts` بیش از حد بزرگ‌اند.
2. server body limit و ciphertext limit تا ۱ گیگابایت تنظیم شده‌اند.
3. stateهای realtime و security در memory هستند و multi-instance نیستند.
4. فایل‌های `.js` تولیدشده کنار `.ts/.tsx` داخل `client/src` وجود دارند؛ این وضعیت منبع حقیقت را مبهم می‌کند.
5. مستندات درباره SQLite/Postgres و الگوریتم رمزنگاری تناقض دارند.
6. پیام سیستمی admin plaintext است.
7. تست‌های موجود سطح پوشش کمی دارند.
8. bundle کلاینت حدود ۸۰۹ کیلوبایت minified است و code splitting ندارد.

### اولویت متوسط

1. metrics فقط در memory نگه‌داری می‌شود.
2. scheduled worker با `setInterval` در همان process اجرا می‌شود.
3. typing و call event با restart از بین می‌روند.
4. Prisma migration منظم در مخزن دیده نمی‌شود و `db push` در راهنما پیشنهاد شده است.
5. schema از نام مدل و fieldهای snake_case استفاده می‌کند که coupling با دیتابیس را در کل کد گسترش داده است.

## وضعیت build و تست در زمان بررسی

### build

- `server: npm run build` موفق شد.
- `client: npm run build` موفق شد.
- Vite درباره bundle بزرگ‌تر از ۵۰۰ کیلوبایت هشدار داد.
- dependency مربوط به Curve25519 importهای browser-incompatible مانند `fs` و `path` دارد که Vite آن‌ها را externalize کرده است.
- dependency مربوط به protobuf از `eval` استفاده می‌کند و Vite هشدار امنیتی داده است.

### test

- تست سرور اجرا نشد، چون `node --test` فایل TypeScript را مستقیم اجرا می‌کند و import مربوط به `../src/validation.js` را پیدا نمی‌کند.
- تست کلاینت در محیط فعلی اجرا نشد، چون executable مربوط به `vitest` در `node_modules` موجود نبود؛ با این حال build کلاینت موفق بود.
- تست‌های فعلی فقط validation، roundtrip رمزنگاری P-256 و merge پیام‌ها را پوشش می‌دهند.

## فایل‌هایی که برای درک پروژه باید اول خوانده شوند

ترتیب پیشنهادی:

1. `README.md`
2. `client/src/main.tsx`
3. `client/src/App.tsx`
4. `client/src/api.ts`
5. `client/src/signal.ts`
6. `client/src/signalStore.ts`
7. `server/src/server.ts`
8. `server/src/db.ts`
9. `server/prisma/schema.prisma`
10. `server/src/validation.ts`
11. `server/src/uploads.ts`
12. `cloudflare/app/main.py`
13. `cloudflare/app/security.py`
14. `cloudflare/app/behavior.py`

## پیشنهاد معماری برای ادامه توسعه

### کلاینت

- تبدیل `App.tsx` به feature moduleها
- استفاده از React Router به‌جای hashهای دستی
- ایجاد auth/session provider
- جدا کردن message sync engine از UI
- جدا کردن Signal service و key lifecycle
- lazy-load کردن admin و social برای کاهش bundle
- تعریف یک schema مشترک برای payloadهای API

### سرور

- تقسیم routeها به pluginهای Fastify
- service layer برای business ruleها
- repository جدا برای هر domain
- transaction برای عملیات چندمرحله‌ای
- queue مستقل برای scheduled messages
- Redis برای WebSocket fan-out، typing، call signaling و rate state
- migration واقعی و versioned
- config validation در startup

### امنیت

- حذف admin پیش‌فرض و bootstrap امن
- OTP واقعی برای شماره تلفن
- انتقال refresh token به HttpOnly Secure SameSite cookie
- allowlist دقیق CORS
- auth جدا برای gateway admin
- محدودیت کوچک‌تر برای body و upload
- rotation و backup امن کلیدها
- تست امنیتی برای SSRF، IDOR، upload، auth و permission

## جمع‌بندی

پروژه از نظر قابلیت، یک MVP ساده نیست و چند domain بزرگ را هم‌زمان پوشش می‌دهد. ایده اصلی E2EE در مسیر پیام‌های عادی رعایت شده و سرور عمدتاً ciphertext ذخیره می‌کند. با این حال بلوغ معماری از گستردگی قابلیت‌ها عقب‌تر است: فایل‌های مرکزی بسیار بزرگ، تست کم، تناقض مستندات، stateهای in-memory و چند ریسک احراز هویت/مدیریت مانع اصلی production-ready شدن هستند.

بهترین نقطه شروع برای بهبود، ابتدا حذف ریسک‌های فوری امنیتی و سپس شکستن `App.tsx` و `server.ts` بر اساس domain است.
