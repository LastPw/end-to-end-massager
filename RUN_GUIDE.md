# راهنمای کامل اجرا (۰ تا ۱۰۰)

این فایل مراحل کامل راه‌اندازی را قدم‌به‌قدم با دستورات ارائه می‌دهد.

---

## پیش‌نیازها

- Node.js (ترجیحاً LTS)
- npm

### ساختار پروژه

- `server/` بک‌اند (Fastify + Prisma + SQLite)
- `client/` فرانت (React + Vite)

---

## اجرا روی سیستم شخصی (لوکال)

### 1) نصب وابستگی‌ها

```bash
cd server
npm install
cd ../client
npm install
```

### 2) تنظیم دیتابیس (SQLite)

```bash
cd ../server
set DATABASE_URL=file:./dev.db
```

### 3) ساخت دیتابیس

```bash
npx prisma db push
```

### 4) اجرای سرور

```bash
npm run dev
```

### 5) اجرای فرانت

پنجره جدید:

```bash
cd client
npm run dev
```

### 6) تست

مرورگر:

```
http://localhost:5173
```

تست سلامت سرور:

```bash
curl -i http://127.0.0.1:3001/health
```

---

## اجرای سرور (Ubuntu)

### 1) نصب Node.js و ابزارها

```bash
apt update
apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

بررسی نسخه:

```bash
node -v
npm -v
```

### 2) کپی کردن پروژه روی سرور

پروژه را در مسیر دلخواه (مثلاً `/root/pakeger/masseger`) قرار بده.

### 3) نصب وابستگی‌ها

```bash
cd /root/pakeger/masseger/server
npm install
cd ../client
npm install
```

### 4) تنظیم دیتابیس (SQLite)

```bash
cd ../server
export DATABASE_URL="file:./dev.db"
```

### 5) ساخت دیتابیس

اگر دیتایی نداری:

```bash
rm -f dev.db
```

بعد:

```bash
npx prisma db push
```

### 6) بیلد و اجرای سرور

```bash
npm run build
npm run start
```

### 7) بیلد فرانت

```bash
cd ../client
npm run build
```

خروجی فرانت در `client/dist` ساخته می‌شود.

---

## راه‌اندازی Nginx

### 1) نصب

```bash
apt install -y nginx
```

### 2) تنظیم کانفیگ

```bash
cat >/etc/nginx/sites-available/pakeger <<'EOF'
server {
  listen 80;
  server_name pakager.ir;

  root /root/pakeger/masseger/client/dist;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
EOF
```

### 3) فعال‌سازی

```bash
ln -sf /etc/nginx/sites-available/pakeger /etc/nginx/sites-enabled/pakeger
nginx -t
systemctl restart nginx
```

---

## اجرای دائمی با PM2

### 1) نصب PM2

```bash
npm install -g pm2
```

### 2) اجرای سرور

```bash
cd /root/pakeger/masseger/server
pm2 start npm --name pakeger-server -- start
pm2 save
```

---

## تست نهایی

```bash
curl -i http://127.0.0.1:3001/health
curl -i http://pakager.ir/health
```

اگر `/health` جواب `{"ok":true}` داد یعنی سرور بالا است.

---

## نکات مهم

- اگر خطای `Permission denied` روی `tsc` یا `tsx` دیدی، اول `npm install` را دوباره بزن.
- اگر `500` روی ثبت‌نام داشتی، دیتابیس قبلی پاک نشده یا schema همگام نیست.
- حتماً قبل از ریلیز عمومی SSL را فعال کن.

