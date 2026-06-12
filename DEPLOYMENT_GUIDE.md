# Panduan Singkat Deployment (Strapi CMS & Next.js Frontend)

Aplikasi ini terdiri dari dua bagian: **Strapi CMS (Backend)** di folder `cms` dan **Next.js (Frontend)** di folder `landing-page`. 
Karena Next.js melakukan Static Site Generation (SSG) saat proses build, **Next.js membutuhkan CMS yang sudah online** agar proses build tidak error (`ECONNREFUSED`).

---

## Urutan Deployment yang Benar

### LANGKAH 1: Deploy Strapi CMS Terlebih Dahulu
1. Deploy folder `cms` ke server/hosting pilihan Anda (misalnya: Heroku, VPS, cPanel, Railway, dll.).
2. Setelah dideploy, pastikan CMS sudah online dan bisa diakses di URL publik, misalnya: `https://cms.widartoimpact.com`.
3. Buatlah API Token baru di menu **Settings > API Tokens** pada dashboard Strapi online Anda.

### LANGKAH 2: Konfigurasi Environment Variables di Hosting Frontend (Vercel/Netlify/VPS)
Sebelum melakukan build pada Next.js frontend, masukkan variabel-variabel lingkungan berikut pada dashboard hosting frontend Anda:

```env
# 1. API Link ke Strapi CMS yang Sudah Online
NEXT_PUBLIC_STRAPI_API_URL=https://cms.widartoimpact.com
NEXT_PUBLIC_STRAPI_API_TOKEN=token_baru_dari_strapi_online

# 2. URL Website Utama
NEXT_PUBLIC_SITE_URL=https://widartoimpact.com

# 3. Kredensial Email Hostinger (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@widartoimpact.com
SMTP_PASS=password_email_anda
MAIL_TO=eko@widartoimpact.com
MAIL_FROM="Widarto Impact <hello@widartoimpact.com>"
```

### LANGKAH 3: Deploy Next.js Frontend
1. Hubungkan repository GitHub Anda ke platform hosting frontend (disarankan menggunakan **Vercel** karena performa Next.js optimal di sana).
2. Tentukan **Root Directory** ke folder `landing-page`.
3. Jalankan deploy / build. Proses build akan sukses mengambil data dari URL Strapi online yang Anda masukkan di Langkah 2.

---

## Troubleshooting Error saat Build
Jika muncul error `fetch failed (ECONNREFUSED)` saat build frontend:
* **Penyebab**: Server Next.js mencoba menghubungi URL Strapi CMS namun tidak mendapat respon (mati/salah URL).
* **Solusi**: Periksa kembali nilai `NEXT_PUBLIC_STRAPI_API_URL` di pengaturan hosting Anda. Pastikan **bukan** `localhost:1337`, melainkan URL Strapi yang sudah online dan aktif.
