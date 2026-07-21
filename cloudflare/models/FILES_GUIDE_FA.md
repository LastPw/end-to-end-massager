# راهنمای فایل‌های پروژه Messager

این فایل فقط وظیفه فایل‌های مهم پروژه را توضیح می‌دهد.

## فایل‌های اصلی سرور

### `server/src/server.ts`

فایل اصلی backend است. سرور Fastify را راه‌اندازی می‌کند و شامل routeهای
ثبت‌نام، ورود، پیام‌ها، گفتگوها، تماس، شبکه اجتماعی و پنل مدیریت است.
WebSocket، rate limit و headerهای امنیتی نیز در همین فایل تنظیم می‌شوند.

### `server/src/db.ts`

تمام عملیات دیتابیس در این فایل قرار دارد. ساخت user، session، conversation،
message، invite، report و داده‌های social از طریق توابع این فایل انجام
می‌شود.

### `server/src/prisma.ts`

یک نمونه مشترک از `PrismaClient` می‌سازد تا فایل‌های دیگر بتوانند به
دیتابیس متصل شوند.

### `server/src/validation.ts`

ورودی‌های API را با Zod بررسی می‌کند. اعتبار username، شماره تلفن، شناسه
دستگاه، نام فایل، URL و اندازه داده‌ها در این فایل کنترل می‌شود.

### `server/src/uploads.ts`

آپلود و دانلود فایل را مدیریت می‌کند. برای S3 یا R2 لینک موقت می‌سازد و در
آپلود مستقیم می‌تواند فایل را با ClamAV اسکن کند.

### `server/src/storage.ts`

برای ذخیره و خواندن فایل JSON رمز‌شده با AES-256-GCM استفاده می‌شود. مسیر
اصلی دیتابیس برنامه Prisma است و این فایل نقش جانبی دارد.

### `server/prisma/schema.prisma`

ساختار دیتابیس را تعریف می‌کند. جدول‌های user، session، conversation،
membership، message، کلیدهای رمزنگاری، invite، admin و شبکه اجتماعی در این
فایل مشخص شده‌اند.

### `server/prisma/dev.db`

فایل دیتابیس SQLite محیط توسعه است.

### `server/scripts/backup-db.ts`

برای تهیه نسخه پشتیبان از دیتابیس استفاده می‌شود.

### `server/scripts/migrate-json-to-sqlite.ts`

داده‌های ساختار قدیمی JSON را به دیتابیس SQLite منتقل می‌کند.

### `server/tests/validation.test.ts`

قوانین validation مانند username، phone، filename و upload key را تست
می‌کند.

### `server/package.json`

وابستگی‌ها و دستورهای اجرای سرور را تعریف می‌کند:

- `npm run dev`: اجرای توسعه
- `npm run build`: تبدیل TypeScript به JavaScript
- `npm run start`: اجرای فایل‌های `dist`
- `npm test`: اجرای تست‌ها

### `server/tsconfig.json`

تنظیمات کامپایل TypeScript سرور است. کدهای `src` را به پوشه `dist` تبدیل
می‌کند.

### `server/dist/server.js`

خروجی کامپایل‌شده `server/src/server.ts` است. این فایل برای اجرا ساخته
می‌شود و نباید مستقیماً ویرایش شود.

## فایل‌های اصلی کلاینت

### `client/src/main.tsx`

نقطه شروع React است و کامپوننت اصلی `App` را داخل صفحه نمایش می‌دهد.

### `client/src/App.tsx`

فایل اصلی رابط کاربری است. صفحه ورود، چت، تنظیمات، تماس، شبکه اجتماعی و پنل
مدیریت در آن قرار دارند. بخش زیادی از state و منطق کلاینت نیز در همین فایل
است.

### `client/src/api.ts`

تمام درخواست‌های HTTP کلاینت به سرور را در قالب functionهای جدا تعریف
می‌کند.

### `client/src/signal.ts`

کلیدها و sessionهای Signal را مدیریت می‌کند و رمزگذاری و رمزگشایی اصلی
پیام‌ها را انجام می‌دهد.

### `client/src/signalStore.ts`

کلیدها، pre-keyها، identityها و sessionهای Signal را در IndexedDB ذخیره
می‌کند.

### `client/src/crypto.ts`

ابزار رمزنگاری ECDH P-256 و AES-GCM را دارد. این مسیر قدیمی‌تر یا کمکی است؛
مسیر اصلی پیام‌ها در `signal.ts` قرار دارد.

### `client/src/messageCache.ts`

ciphertext پیام‌ها و اطلاعات رسانه‌ها را برای دسترسی آفلاین در IndexedDB
نگه می‌دارد.

### `client/src/messageUtils.ts`

پیام‌های جدید را با لیست قبلی ادغام، مرتب و از تکرار جلوگیری می‌کند.

### `client/src/styles.css`

تمام ظاهر، layout، رنگ‌ها و responsive بودن رابط کاربری را تعریف می‌کند.

### `client/src/countries.ts`

اطلاعات کشورها و پیش‌شماره تلفن را نگه می‌دارد.

### فایل‌های `.js` کنار فایل‌های TypeScript

فایل‌هایی مانند `App.js` و `api.js` نسخه‌های JavaScript هستند. منبع اصلی
توسعه فایل‌های `.ts` و `.tsx` است و وجود هر دو نسخه می‌تواند باعث سردرگمی
شود.

### `client/tests/crypto.test.ts`

تولید کلید و roundtrip رمزگذاری و رمزگشایی را تست می‌کند.

### `client/tests/message-utils.test.ts`

ادغام، حذف تکرار و ترتیب پیام‌ها را تست می‌کند.

### `client/vite.config.ts`

تنظیمات Vite و پورت توسعه کلاینت را مشخص می‌کند.

### `client/package.json`

وابستگی‌ها و دستورهای اجرا، build و test کلاینت را تعریف می‌کند.

## فایل‌های Security Gateway

### `cloudflare/app/main.py`

برنامه اصلی FastAPI و reverse proxy است. درخواست‌ها را بررسی و سپس به سرور
اصلی منتقل می‌کند. پنل‌های مدیریتی gateway نیز اینجا تعریف شده‌اند.

### `cloudflare/app/security.py`

موتور تصمیم امنیتی است. WAF، rate limit، تشخیص scanner، challenge و امتیاز
خطر مدل‌های ML را مدیریت می‌کند.

### `cloudflare/app/behavior.py`

از رخدادهای mouse، keyboard، scroll و navigation ویژگی‌های رفتاری استخراج
می‌کند.

### `cloudflare/app/ddos.py`

نرخ درخواست سراسری و هر IP را بررسی می‌کند و spikeهای مشکوک را تشخیص می‌دهد.

### `cloudflare/app/ratelimit.py`

یک rate limiter ساده با پنجره زمانی یک دقیقه‌ای پیاده‌سازی می‌کند.

### `cloudflare/app/storage.py`

دیتابیس SQLite مخصوص gateway را ایجاد و مدیریت می‌کند. رخدادهای رفتاری،
تصمیم‌ها، قوانین WAF و اعتبار IP در آن ذخیره می‌شوند.

### `cloudflare/app/domains.py`

ثبت و تأیید دامنه با DNS TXT و بررسی IPهای gateway را انجام می‌دهد.

### `cloudflare/app/config.py`

تنظیمات gateway را از environment variableها می‌خواند.

### `cloudflare/app/session_state.py`

stateهای موقت session مانند fingerprint، trap و بررسی محتوا را نگه می‌دارد.

### `cloudflare/app/metrics.py`

آمار و سری زمانی تصمیم‌های امنیتی را جمع‌آوری می‌کند.

### `cloudflare/app/reporting.py`

از رخدادهای امنیتی گزارش PDF می‌سازد.

### `cloudflare/ml/train.py`

مدل‌های تشخیص bot و رفتار مشکوک را با داده مصنوعی آموزش می‌دهد.

### `cloudflare/ml/evaluate.py`

مدل‌های آموزش‌دیده را ارزیابی می‌کند.

### `cloudflare/ml/generate_dataset.py`

dataset مصنوعی برای آزمایش مدل‌ها می‌سازد.

## مستندات مهم

### `README.md`

معرفی پروژه، امکانات، فناوری‌ها و روش اجرای کلی را توضیح می‌دهد.

### `RUN_GUIDE.md`

راهنمای اجرای پروژه در محیط محلی و سرور لینوکس است.

### `SECURITY_MODEL.md`

مدل امنیتی فعلی، اطلاعات قابل مشاهده برای سرور و خطر XSS را توضیح می‌دهد.

### `CRYPTO.md`

طرح رمزنگاری قدیمی P-256 و AES-GCM را توضیح می‌دهد و با مسیر Signal فعلی
کاملاً هماهنگ نیست.

### `THREAT_MODEL.md`

تهدیدهای درون و بیرون محدوده پروژه را مشخص می‌کند.

### `ARCHITECTURE_FA.md`

گزارش کلی معماری، جریان داده، مدل دیتابیس، امنیت و مشکلات فنی پروژه است.
