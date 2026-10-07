# Project Structure — Portfolio Backend API

## Overview
Backend API performa tinggi berbasis **Hono.js** dengan arsitektur **Module-based Layered Architecture**, dirancang untuk sistem personal portfolio profesional dan admin Content Management System (CMS).

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono.js](https://hono.dev/)
- **Database**: MySQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: Zod + `@hono/zod-openapi`
- **API Documentation**: Scalar (`/docs`) + OpenAPI 3.0 (`/openapi.json`)
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` + Header `X-App-Token`
- **File Storage**: Cloudinary (signed uploads)

---

## 📁 Struktur Folder Proyek

```
be-starter-hono/
├── drizzle/                             # File migrasi SQL hasil generate drizzle-kit
├── src/
│   ├── index.ts                         # Entry point: Server setup, global middleware, route mounts
│   ├── app/                             # Modul-modul fitur domain
│   │   ├── portfolio_profile/           # Modul profil developer (bio, stats, roles, socials)
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_project/           # Modul katalog proyek & studi kasus (case studies)
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_blog/              # Modul blog, artikel teknis, & WYSIWYG content
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_certificate/       # Modul sertifikasi, lisensi, & kredensial
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_service/           # Modul layanan rekayasa piranti lunak
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_about/             # Modul riwayat pengalaman kerja & pendidikan
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── portfolio_contact/           # Modul kontak publik & inbox admin
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── user/                        # Autentikasi user, registrasi, login, profil
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── role/                        # Manajemen role pengguna (ADMIN, USER)
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── menu/                        # Manajemen navigasi hierarkis admin
│   │   │   ├── controller/
│   │   │   └── route/
│   │   ├── role_permission/             # Otorisasi permission RBAC per menu
│   │   │   ├── controller/
│   │   │   └── route/
│   │   └── upload/                      # Cloudinary signature helper
│   │       ├── controller/
│   │       └── route/
│   ├── db/
│   │   ├── index.ts                     # Inisialisasi koneksi MySQL pool & Drizzle ORM
│   │   ├── schema.ts                    # Definisi seluruh tabel database
│   │   ├── migrate.ts                   # Eksekusi migrasi Drizzle
│   │   └── seed.ts                      # Seeder data awal (admin, roles, menus, portfolio)
│   └── middleware/
│       ├── auth.ts                      # JWT verification & app token check
│       └── rbac.ts                      # Pemeriksaan permission role pengguna
├── drizzle.config.ts                    # Konfigurasi drizzle-kit
├── package.json                         # Dependencies & run scripts
├── tsconfig.json                        # Konfigurasi TypeScript
├── .env.example                         # Contoh variabel lingkungan
└── README.md                            # Panduan setup & dokumentasi ringkas
```

---

## 🗄️ Database Schema & Tabel

Semua tabel didefinisikan menggunakan Drizzle ORM di [`src/db/schema.ts`](file:///c:/project/porto/be-starter-hono/src/db/schema.ts):

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `users` | Akun pengguna dan administrator | `id`, `email`, `password`, `name`, `role_id`, `created_at` |
| `roles` | Daftar peran pengguna | `id`, `code` (e.g. `ADMIN`), `name` |
| `menus` | Menu navigasi dashboard admin | `id`, `name`, `path`, `permission_path`, `icon`, `is_visible`, `parent_id` |
| `role_permissions` | Hak akses RBAC per peran terhadap menu | `id`, `role_id`, `menu_id`, `can_read`, `can_create`, `can_update`, `can_delete` |
| `profiles` | Profil pengembang (*single-row personal portfolio*) | `id`, `name`, `short_name`, `role`, `roles_list` (JSON), `tagline`, `bio`, `location`, `availability`, `avatar_url`, `resume_url`, `email`, `github`, `linkedin`, `whatsapp`, `stats` (JSON) |
| `projects` | Katalog proyek & studi kasus rekayasa | `id`, `title`, `slug`, `category`, `short_description`, `full_description` (HTML), `image_url`, `demo_url`, `github_url`, `year`, `featured`, `tags` (JSON), `metrics` (JSON), `architecture_points` (JSON), `sort_order` |
| `blogs` | Artikel blog & catatan arsitektur sistem | `id`, `title`, `slug`, `excerpt`, `content` (HTML WYSIWYG), `cover_image`, `published_at`, `read_time`, `category`, `tags` (JSON), `featured`, `is_published` |
| `certificates` | Sertifikasi profesional & lisensi | `id`, `title`, `issuer`, `issuer_logo`, `issue_date`, `expiry_date`, `credential_id`, `credential_url`, `image`, `skills` (JSON), `sort_order` |
| `services` | Layanan rekayasa piranti lunak | `id`, `service_code`, `number`, `title`, `description`, `icon`, `features` (JSON), `deliverables`, `sort_order` |
| `experiences` | Riwayat pengalaman kerja | `id`, `role`, `company`, `period`, `location`, `company_url`, `description`, `skills` (JSON), `sort_order` |
| `educations` | Riwayat pendidikan formal | `id`, `degree`, `institution`, `period`, `description`, `sort_order` |
| `skill_categories` | Kategori keahlian & stack teknis | `id`, `category`, `skills` (JSON), `sort_order` |
| `contact_messages` | Pesan masuk dari form kontak publik | `id`, `name`, `email`, `subject`, `message`, `is_read`, `created_at` |

---

## 🔄 Alur Request & Middleware Chain

1. **Global CORS**: Memvalidasi origin dari `ALLOWED_APP_URL` (misal `http://localhost:3000`).
2. **Public Routes**: Endpoint seperti `GET /api/projects`, `GET /api/blogs`, `GET /api/profile`, dan `POST /api/contact` terbuka untuk umum tanpa token.
3. **Protected Routes (Admin)**:
   - **`jwtMiddleware`**: Memverifikasi header `Authorization: Bearer <token>` dan mencocokkan secret JWT.
   - **`X-App-Token` Verification**: Memastikan request berasal dari aplikasi klien yang terotorisasi.
   - **RBAC Middleware**: Memeriksa izin CRUD pengguna pada tabel `role_permissions` sesuai peran mereka.
4. **Controller Layer**: Mengekstrak parameter/body request, melakukan sanitasi data, berinteraksi dengan database via Drizzle ORM, dan mengembalikan response JSON seragam `{ success: true, data: ... }`.

---

## 🌐 Rangkuman Endpoint API

### Public Endpoints
- `GET /api/health` — Status kesehatan server
- `GET /api/profile` — Data profil publik
- `GET /api/projects` — Katalog seluruh proyek
- `GET /api/projects/:idOrSlug` — Detail proyek berdasarkan slug atau ID
- `GET /api/blogs` — Daftar artikel yang terbit (`is_published = true`)
- `GET /api/blogs/:slug` — Detail artikel berdasarkan slug atau ID
- `GET /api/certificates` — Daftar sertifikasi
- `GET /api/services` — Daftar layanan rekayasa
- `GET /api/about` — Riwayat pengalaman & pendidikan
- `POST /api/contact` — Mengirim pesan formulir kontak
- `POST /api/users/login` — Autentikasi pengguna & login

### Protected Endpoints (Admin)
- `PUT /api/profile` — Memperbarui profil
- `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id` — CRUD Proyek
- `GET /api/blogs?all=true` — Seluruh artikel (termasuk draf)
- `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id` — CRUD Artikel
- `POST /api/certificates`, `PUT /api/certificates/:id`, `DELETE /api/certificates/:id` — CRUD Sertifikasi
- `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id` — CRUD Layanan
- `GET /api/contact` — Melihat pesan inbox kontak
- `PUT /api/contact/:id`, `DELETE /api/contact/:id` — Manajemen inbox
- `POST /api/uploads/signature` — Membuat signed params untuk upload Cloudinary
- `GET /api/users/me/navigation` — Navigasi menu dinamis sesuai role pengguna
