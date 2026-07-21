سناریوهای تست و ارزیابی

1) ترافیک انسانی
- تعامل طبیعی با صفحه (اسکرول، کلیک، تایپ)
- انتظار: Allow با ریسک پایین

2) ربات ساده (curl/requests)
- نرخ بالا، بدون رویداد رفتاری
- انتظار: Challenge یا Block به دلیل سیگنال کم

3) Selenium/Headless
- هدرهای مشکوک + ریتم ثابت
- انتظار: افزایش Bot Score و Block

4) Brute force
- درخواست‌های متعدد به مسیر ورود
- انتظار: Rate limit و Block موقت

5) Scraping
- مسیرهای تکراری با dwell پایین
- انتظار: Challenge سپس Block

6) Recon Scan
- تلاش برای مسیرهای حساس (.env, /.git)
- انتظار: هدایت به تله و سپس Block

اسکریپت شبیه‌سازی
- اجرای ترافیک انسانی: `python scripts/traffic_sim.py --scenario human`
- اجرای ترافیک رباتی: `python scripts/traffic_sim.py --scenario bot`
- اجرای ریکان: `python scripts/traffic_sim.py --scenario recon`
- اجرای بروت‌فورس: `python scripts/traffic_sim.py --scenario bruteforce`
- شبیه‌سازی رفتار مرورگر (رویدادهای JS): `python scripts/behavior_sim.py --seconds 30`

متریک‌های گزارش
- Accuracy, Precision, Recall, F1, ROC-AUC
- False Positive/False Negative
- Latency افزوده
