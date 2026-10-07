# Portfolio Backend API — Hono & Bun

Backend RESTful API performa tinggi untuk sistem Portfolio & Content Management System (CMS), dibangun dengan **Hono.js**, **Bun**, **Drizzle ORM**, **MySQL**, **JWT**, dan **Cloudinary**.

---

## 🚀 Fitur Utama & Modul

### 1. Modul Portfolio
- **Profile (`/api/profile`)**: Manajemen profil developer, peran/spesialisasi, bio, ketersediaan (*availability*), statistik pengalaman, dan tautan sosial (GitHub, LinkedIn, WhatsApp, Email).
- **Projects (`/api/projects`)**: Katalog proyek & studi kasus rekayasa piranti lunak (*case studies*). Mendukung slug URL, deskripsi semantik HTML/WYSIWYG, metrik hasil, poin arsitektur, gambar cover, demo URL, dan GitHub repository.
- **Blog & Notes (`/api/blogs`)**: Manajemen artikel teknik dan arsitektur piranti lunak. Dilengkapi slug URL, kalkulasi estimasi waktu baca otomatis, kategori, tag, status terbit (*is_published*), artikel unggulan (*featured*), dan integrasi rich-text HTML.
- **Certificates (`/api/certificates`)**: Katalog sertifikasi dan lisensi profesional lengkap dengan kredensial ID, verifikasi URL, logo penerbit, dan daftar keahlian terkait.
- **Services (`/api/services`)**: Penawaran layanan rekayasa perangkat lunak, fitur, kode layanan, dan deliverables teknis.
- **About (`/api/about`)**: Riwayat pengalaman kerja (*work experience*), pendidikan (*education*), dan perjalanan karier.
- **Contact Inbox (`/api/contact`)**: Penampung formulir kontak/pesan masuk dari halaman publik portfolio, dilengkapi status baca/balas.

### 2. Modul RBAC & Core
- **Users & Auth (`/api/users`)**: Autentikasi berbasis JWT, hashing password dengan bcryptjs, dan profil pengguna.
- **Roles & Permissions (`/api/roles`, `/api/role-permissions`)**: Role-Based Access Control (RBAC) dinamis untuk otorisasi endpoint admin.
- **Navigation Menus (`/api/menus`)**: Manajemen struktur menu hierarkis dashboard admin.
- **Media Uploads (`/api/uploads`)**: Helper upload gambar/screenshot berformat signed URL Cloudinary dan penyimpanan lokal/cloud.

---

## 🛠️ Tech Stack & Prasyarat

- **Runtime**: [Bun](https://bun.sh/) (v1.1+)
- **Framework**: [Hono.js](https://hono.dev/) (v4.x)
- **Database & ORM**: MySQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Validasi**: Zod & `@hono/zod-openapi`
- **Autentikasi**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Media Storage**: Cloudinary SDK
- **Dokumentasi API**: Scalar (`/docs`) & OpenAPI 3.0 (`/openapi.json`)

---

## 📦 Instalasi & Setup

### 1. Clone & Install Dependencies
```bash
bun install
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
# Atau di PowerShell:
Copy-Item .env.example .env
```

Pastikan variabel berikut terisi di `.env`:
```env
DATABASE_URL=mysql://root:password@localhost:3306/portfolio_db
PORT=7000
APP_TOKEN=your-secure-app-token
JWT_SECRET=your-jwt-secret-key-here
ALLOWED_APP_URL=http://localhost:3000
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_FOLDER=portfolio
```

### 3. Setup Database & Migrasi
Buat database di MySQL terlebih dahulu:
```sql
CREATE DATABASE portfolio_db;
```

Jalankan push skema database Drizzle:
```bash
bun run db:push
```
*Atau gunakan migrasi SQL standar:*
```bash
bun run db:generate
bun run db:migrate
```

### 4. Seed Data Awal
Jalankan seeder untuk mengisi data default admin, peran, menu, profil, dan data awal portfolio:
```bash
bun run db:seed
```

**Kredensial Default:**
- **Admin**: `admin@example.com` / `password123`
- **User**: `user@example.com` / `password123`

---

## 🏃 Menjalankan Server

### Mode Development (Hot-Reload)
```bash
bun run dev
```

Server default berjalan di `http://localhost:7000`.

### Health Check & API Docs
- **Health**: `GET http://localhost:7000/api/health`
- **Interactive API Docs (Scalar)**: `GET http://localhost:7000/docs`
- **OpenAPI Schema**: `GET http://localhost:7000/openapi.json`

---

## 🔐 Keamanan & Header Autentikasi

Endpoint yang dilindungi (*Admin / Protected*) mewajibkan header autentikasi berikut:
```http
Authorization: Bearer <your-jwt-token>
X-App-Token: <your-app-token>
```

**Alur Autentikasi:**
1. Login via `POST /api/users/login` dengan email dan password.
2. Salin token dari response JSON.
3. Lampirkan token pada header `Authorization` dan `X-App-Token` saat memanggil endpoint mutasi (POST, PUT, DELETE).

---

## 📜 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
|---|---|
| `bun run dev` | Menjalankan dev server dengan hot reload |
| `bun run start` | Menjalankan server mode production |
| `bun run db:push` | Sinkronisasi skema Drizzle langsung ke database MySQL |
| `bun run db:generate` | Membuat file migrasi SQL dari skema |
| `bun run db:migrate` | Menjalankan migrasi database SQL |
| `bun run db:studio` | Membuka UI visual database Drizzle Studio |
| `bun run db:seed` | Menjalankan seed data awal |

---

Untuk detail struktur modul dan panduan pengembang AI agent, silakan baca [STRUCTURE.md](./STRUCTURE.md) dan [AGENTS.md](./AGENTS.md).
