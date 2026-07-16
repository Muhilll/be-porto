# Hono Backend Starter

Backend starter berbasis Hono, Bun, Drizzle ORM, MySQL, JWT, dan Cloudinary.

Starter ini berisi modul awal:

- users
- roles
- menus
- role permissions sebagai pendukung RBAC
- uploads sebagai helper signed upload Cloudinary

## Prasyarat

- Bun
- MySQL
- Akun Cloudinary jika fitur upload akan digunakan

## Install Dependency

```bash
bun install
```

## Setup Environment

Copy `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi `.env` minimal:

```env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
PORT=3000
APP_TOKEN=your-app-token
JWT_SECRET=your-jwt-secret
ALLOWED_APP_URL=http://localhost:5000
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_FOLDER=uploads
```

Keterangan:

- `DATABASE_URL`: koneksi database MySQL
- `PORT`: port server saat dijalankan lokal
- `APP_TOKEN`: token tambahan untuk endpoint protected lewat header `X-App-Token`
- `JWT_SECRET`: secret untuk generate dan verify JWT
- `ALLOWED_APP_URL`: daftar origin frontend, pisahkan dengan koma jika lebih dari satu
- `CLOUDINARY_URL`: satu konfigurasi Cloudinary untuk upload
- `CLOUDINARY_FOLDER`: folder default upload Cloudinary, default `uploads`

## Setup Database

Buat database MySQL terlebih dahulu:

```sql
CREATE DATABASE hono_starter;
```

Lalu jalankan salah satu:

```bash
bun run db:generate
bun run db:migrate
```

atau untuk development cepat:

```bash
bun run db:push
```

## Seed Data Awal

```bash
bun run db:seed
```

Default user:

- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`

Seeder akan mengisi roles, menus, users, dan permission penuh untuk role `ADMIN`.

## Menjalankan Project

```bash
bun run dev
```

Default server berjalan mengikuti `PORT`:

```text
http://localhost:3000
```

Endpoint public:

- `GET /`
- `GET /api/health`
- `GET /docs`
- `GET /openapi.json`
- `POST /api/users/login`

## Struktur API

Base path utama:

- `/api/users`
- `/api/roles`
- `/api/menus`
- `/api/role-permissions`
- `/api/uploads`

## Authentication dan Header

Endpoint protected membutuhkan:

```http
Authorization: Bearer <your-jwt-token>
X-App-Token: <your-app-token>
```

Alur penggunaan:

1. Login lewat `POST /api/users/login`
2. Ambil token dari response login
3. Kirim token dan `X-App-Token` saat mengakses endpoint protected

## Permission

Permission route memakai tabel:

- `roles`
- `menus`
- `role_permissions`

`permission_path` pada menu dipakai untuk mencocokkan endpoint, misalnya `/api/users`.
Frontend bisa mengambil navigation sesuai role dari:

```http
GET /api/users/me/navigation
```

## Upload Cloudinary

Starter ini menyisakan satu konfigurasi upload Cloudinary.

Ambil signed upload params lewat:

```http
POST /api/uploads/signature
```

Response berisi `apiKey`, `cloudName`, `folder`, `signature`, `timestamp`, dan `uploadUrl`.
Frontend mengirim file langsung ke `uploadUrl`, lalu modul fitur yang membutuhkan gambar
dapat menyimpan `secure_url` dan `public_id` di tabelnya sendiri.

## Script

```bash
bun run dev
bun run start
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
bun run db:seed
```
