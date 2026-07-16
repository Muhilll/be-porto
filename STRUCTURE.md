# Project Structure

## Overview
Backend API berbasis **Hono.js** dengan arsitektur **Module-based Layered Architecture**. Project ini menyediakan sistem manajemen user, role, menu, dan permission (RBAC) dengan dukungan OpenAPI documentation, file upload via Cloudinary, dan integrasi payment gateway Midtrans.

- **Runtime**: Bun
- **Framework**: Hono.js
- **Database**: MySQL via Drizzle ORM
- **Validation**: Zod + @hono/zod-openapi
- **Deployment**: Vercel (serverless)
- **API Docs**: Scalar (via @scalar/hono-api-reference)
- **Payment Gateway**: Midtrans (Snap + Core API)
- **WhatsApp API**: Fonnte (untuk notifikasi struk pesanan & reservasi)

---

## Folder Tree

```
cafe-be-app/
├── drizzle/                        # Migrasi database (auto-generated oleh drizzle-kit)
│   ├── 0000_third_apocalypse.sql
│   └── meta/
│       ├── _journal.json
│       └── 0000_snapshot.json
├── src/
│   ├── index.ts                    # Entry point - app setup, global middleware, route mounting
│   ├── app/                        # Feature modules (domain-driven)
│   │   ├── menu/                   # Manajemen menu navigasi
│   │   │   ├── contract/           # Entity type definition
│   │   │   │   └── menu.contract.ts
│   │   │   ├── controller/         # HTTP handler (tipis, tanpa validasi manual)
│   │   │   │   └── menu.controller.ts
│   │   │   ├── dto/                # Zod schemas untuk request/response
│   │   │   │   ├── menu-request.dto.ts
│   │   │   │   └── menu-response.dto.ts
│   │   │   ├── repository/         # Database queries (CQRS split)
│   │   │   │   ├── menu-read.repository.ts
│   │   │   │   └── menu-write.repository.ts
│   │   │   ├── route/              # OpenAPI route definitions + middleware registration
│   │   │   │   ├── menu.openapi.ts
│   │   │   │   └── menu.route.ts
│   │   │   └── service/            # Business logic
│   │   │       └── menu.service.ts
│   │   ├── role/                   # CRUD role (struktur identik)
│   │   ├── role_permission/        # CRUD role permission + RBAC query
│   │   ├── upload/                 # Cloudinary signed upload (hanya controller + route)
│   │   ├── cafe/                   # Domain Cafe (dish, category, order)
│   │   │   ├── dish_category/      # CRUD kategori menu makanan
│   │   │   ├── dish/               # CRUD dish/makanan
│   │   │   ├── dish_image/         # CRUD gambar dish (Cloudinary)
│   │   │   ├── dish_order/         # CRUD pesanan makanan
│   │   │   └── dish_order_detail/  # CRUD detail pesanan makanan
│   │   ├── billiard/               # Domain Billiard (table, reservation, schedule)
│   │   │   ├── billiard_table_type/ # CRUD tipe meja billiard
│   │   │   ├── billiard_table/     # CRUD meja billiard
│   │   │   ├── billiard_table_image/ # CRUD gambar meja (Cloudinary)
│   │   │   ├── schedule/           # CRUD jadwal/slot waktu reservasi
│   │   │   └── reservation/        # CRUD reservasi meja billiard
│   │   ├── payment/                # Manajemen pembayaran + Midtrans webhook
│   │   └── user/                   # User management, auth, navigation
│   │       ├── contract/
│   │       │   └── user.contract.ts
│   │       ├── controller/
│   │       │   ├── user-auth.controller.ts       # Login handler
│   │       │   ├── user-navigation.controller.ts # Sidebar navigation tree
│   │       │   └── user.controller.ts            # CRUD user
│   │       ├── dto/
│   │       │   ├── user-request.dto.ts
│   │       │   └── user-response.dto.ts
│   │       ├── repository/
│   │       │   ├── user-navigation.repository.ts # Navigation tree builder
│   │       │   ├── user-read.repository.ts
│   │       │   └── user-write.repository.ts
│   │       ├── route/
│   │       │   ├── user.openapi.ts
│   │       │   └── user.route.ts
│   │       └── service/
│   │           ├── user-auth.service.ts
│   │           ├── user-navigation.service.ts
│   │           └── user.service.ts
│   ├── db/                         # Database layer
│   │   ├── connection.ts           # Drizzle + mysql2 connection
│   │   ├── index.ts                # Re-exports db & schema
│   │   ├── migrate.ts              # Migration runner script
│   │   ├── schema.ts               # Drizzle table definitions (16 tabel)
│   │   └── seed.ts                 # Initial data seeder
│   ├── docs/                       # OpenAPI documentation infrastructure
│   │   ├── openapi-common.ts       # Shared helpers, schemas, utilities
│   │   ├── openapi-schemas.ts      # Reusable entity schemas (Zod → OpenAPI)
│   │   └── openapi.ts              # Document merger & Scalar setup
│   ├── lib/                        # Library integrations
│   │   ├── fonnte.ts               # Fonnte WhatsApp API client
│   │   └── midtrans.ts             # Midtrans Snap & Core API client
│   ├── middleware/                  # Global & shared middleware
│   │   ├── appToken.ts             # X-App-Token validation + request logger
│   │   ├── auth.ts                 # JWT Bearer authentication
│   │   ├── errorHandler.ts         # Global error handler + 404 handler
│   │   ├── originGuard.ts          # CORS policy + origin whitelist
│   │   └── permission.ts           # Dynamic RBAC permission checker
│   └── utils/                      # Utility functions
│       ├── cloudinary.ts           # Cloudinary config, signed upload, image delete
│       └── jwt.ts                  # JWT generate, verify, decode
├── drizzle.config.ts               # Drizzle Kit configuration
├── package.json                    # Dependencies & scripts (Bun)
├── tsconfig.json                   # TypeScript config
├── vercel.json                     # Vercel deployment config
├── .env.example                    # Environment variables template
└── README.md
```

---

## Database Schema

Sistem menggunakan MySQL dengan tabel-tabel utama dibagi menjadi:

**A. RBAC & Autentikasi (4 tabel inti)**
```
┌──────────────┐     ┌──────────────────┐
│    roles     │     │      menus       │
├──────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)          │
│ code (UQ)    │     │ name             │
│ name         │     │ path             │
│              │     │ permission_path  │ ← digunakan utk RBAC matching
│              │     │ icon             │
│              │     │ is_visible       │ ← toggle tampilan di frontend sidebar
│ created_at   │     │ parent_id (FK→id)│ ← self-referencing (hierarchical menu)
│ updated_at   │     │ created_at       │
└──────┬───────┘     │ updated_at       │
       │             └────────┬─────────┘
       ▼                      ▼
┌──────────────┐     ┌──────────────────┐
│    users     │     │ role_permissions  │
├──────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)          │
│ email (UQ)   │     │ role_id (FK→roles)│
│ password     │     │ menu_id (FK→menus)│
│ name         │     │ can_read         │
│ role_id (FK) │────→│ can_create       │
│ created_at   │     │ can_update       │
│ updated_at   │     │ can_delete       │
└──────────────┘     │ can_report       │
                     │ created_at       │
                     │ updated_at       │
                     └──────────────────┘
```

**Catatan penting:**
- `menus.permission_path` berisi path API (contoh: `/api/roles`) yang digunakan oleh `permission.ts` middleware untuk mencocokkan permission secara dinamis
- `menus.parent_id` mendukung hierarki menu (parent → children) untuk sidebar navigation
- `role_permissions` menghubungkan role ke menu dengan 5 flag aksi: `can_read`, `can_create`, `can_update`, `can_delete`, `can_report`

**B. Domain Cafe (5 tabel)**
- **`dish_categories`**: id, name, icon, timestamps
- **`dishes`**: id, dish_category_id (FK→dish_categories), name, slug (UQ), description, price, thumbnail, thumbnail_public_id, is_available, is_active, timestamps
- **`dish_images`**: id, dish_id (FK→dishes), image, image_public_id, timestamps
- **`dish_orders`**: id, guest_name, guest_phone, total, tax, service_fee, nett_price, status (enum: pending/confirmed/preparing/completed/cancelled), timestamps
- **`dish_order_details`**: id, dish_order_id (FK→dish_orders), dish_id (FK→dishes), quantity, notes, timestamps

*Catatan: Pembaruan data pada `dish_order_details` (tambah/hapus) akan secara otomatis mengkalkulasi ulang field `total`, `tax_amount`, `service_fee_amount`, dan `nett_price` pada tabel induk `dish_orders` melalui logic Service Layer.*

**C. Domain Billiard (5 tabel)**
- **`billiard_table_types`**: id, name, icon, description, timestamps
- **`billiard_tables`**: id, table_type_id (FK→billiard_table_types), name, slug (UQ), price, thumbnail, thumbnail_public_id, is_available, is_active, timestamps
- **`billiard_table_images`**: id, billiard_table_id (FK→billiard_tables), image, image_public_id, timestamps
- **`schedules`**: id, start_time (TIME), end_time (TIME), timestamps — *Slot waktu yang tersedia untuk reservasi*
- **`reservations`**: id, billiard_table_id (FK→billiard_tables), guest_name, guest_phone, date (DATE), schedule_id (FK→schedules), guest_count, notes, status (enum: pending/confirmed/preparing/completed/cancelled), timestamps

**D. Transaction (1 tabel)**
- **`payments`**: id, type (enum: dish_order/reservation), dish_order_id (FK→dish_orders, nullable), reservation_id (FK→reservations, nullable), method (enum: qris/bank_transfer/cash/ewallet/credit_card), provider (enum: midtrans/xendit/manual/cashier), transaction_id, gross_amount, status (enum: pending/paid/failed/expired/cancelled/refunded), url, snap_token, paid_at, expired_at, timestamps

**Total: 16 tabel** (4 RBAC + 5 Cafe + 5 Billiard + 1 Payment + 1 Schedule *di bawah Billiard*)

---

## Alur Request (Request Flow)

### Protected Endpoint (standar)
```
HTTP Request
    ↓
[Global Middleware - index.ts]
    ├── corsMiddleware        → CORS headers
    ├── originGuard           → Whitelist origin validation
    ├── logger()              → Hono built-in logger
    └── loggerMiddleware      → Custom timing logger
    ↓
[Module Middleware - route.ts]
    ├── jwtMiddleware         → Verify Bearer token, attach user ke context
    ├── appTokenMiddleware    → Verify X-App-Token header
    └── requirePermission()   → Dynamic RBAC: resolve path → lookup role_permissions → check action
    ↓
[Zod Validation - OpenAPIHono defaultHook]
    └── Auto-validate request body/params berdasarkan schema di *.openapi.ts
    ↓
Controller (*.controller.ts)
    └── Extract params/body → call Service → return JSON response
    ↓
Service (*.service.ts)
    └── Business logic → call Repository
    ↓
Repository (*-read.repository.ts / *-write.repository.ts)
    └── Drizzle query builder → Database
    ↓
Database (MySQL)
```

### Public Endpoint (login)
```
HTTP Request → POST /api/users/login
    ↓
[Global Middleware] → CORS, Origin Guard, Logger
    ↓
[Zod Validation] → loginRequestSchema (email, password)
    ↓
UserAuthController.login
    ↓
UserAuthService.login → bcrypt compare → generateToken (JWT)
    ↓
Response: { token, user }
```

### Payment Flow (Midtrans Integration)
```
1. Create Payment (cash):
   POST /api/payments → PaymentService.create()
     → status = "paid", paid_at = now
     → Update related dish_order/reservation status to "completed"

2. Create Payment (midtrans):
   POST /api/payments → PaymentService.create()
     → Check for existing pending payment (avoid duplicates)
     → Create Midtrans Snap transaction → get snap_token + redirect_url
     → Return { id, snap_token, url, transaction_id }

3. Midtrans Webhook:
   POST /api/payments/webhook/midtrans (PUBLIC, NO AUTH)
     → Verify SHA-512 signature
     → Map transaction_status → payment status
     → Update payment record + related order/reservation status
```

---

## Arsitektur Module

Setiap module mengikuti **6-layer pattern** yang konsisten:

### 1. Contract (`contract/*.contract.ts`)
- **Tujuan**: Type definition murni (TypeScript types)
- **Pattern**: `export type EntityNameEntity = { ... }`
- **Contoh**: `MenuEntity`, `PublicUser`, `NavigationItem`, `ScheduleEntity`, `PaymentEntity`

### 2. DTO (`dto/*-request.dto.ts`, `dto/*-response.dto.ts`)
- **Tujuan**: Zod schema untuk validasi input/output + OpenAPI spec generation
- **Request DTO**: `z.object({...}).openapi("CreateXxxRequest")` → `export type CreateXxxRequestDto = z.infer<...>`
- **Response DTO**: Menggunakan `createSuccessEnvelopeSchema()` untuk envelope `{ success, data, message }`
- **Naming**: `create*RequestSchema`, `update*RequestSchema`, `*ListResponseSchema`, `*DetailResponseSchema`, `*MutationResponseSchema`

### 3. Route (`route/*.openapi.ts`, `route/*.route.ts`)
- **`*.openapi.ts`**: Definisi route per-endpoint via `createRoute()` dari `@hono/zod-openapi`
  - Berisi: method, path, tags, security, request schema, response schema
  - Endpoint public menggunakan `security: []`
  - Endpoint protected menggunakan `security: protectedSecurity`
- **`*.route.ts`**: Router setup
  - Membuat router via `createOpenApiRouter()`
  - Register security schemes via `registerDefaultSecuritySchemes(router)`
  - Apply module middleware: `router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission())`
  - Register routes via `registerOpenApiRoute(router, routeConfig, controllerMethod)`
  - Export `getXxxOpenApiDocument()` untuk merger di `openapi.ts`

**Tiga pola middleware yang digunakan:**
- **Global di route.ts**: `router.use("*", ...)` → berlaku untuk semua endpoint di module (contoh: menu, role, role_permission, schedule)
- **Per-endpoint di openapi.ts**: `middleware: [jwtMiddleware, ...] as const` → hanya untuk endpoint tertentu (contoh: user module yang punya login public)
- **Hybrid (public + protected)**: Register public routes SEBELUM `router.use("*", ...)`, lalu register protected routes setelahnya. Pola ini digunakan pada fitur **Public APIs** (seperti public endpoint untuk `dishes`, `dish_categories`, `billiard_tables`) yang diakses oleh halaman *Landing Page* tanpa token, serta webhook dari pihak ketiga (contoh: payment module — webhook midtrans public).

### 4. Controller (`controller/*.controller.ts`)
- **Pattern**: Static class methods
- **Prinsip**: Sangat tipis - **tidak ada try-catch** (ditangani global error handler), **tidak ada validasi manual** (ditangani Zod defaultHook)
- **Tugas**: Extract param/body → call Service → return `c.json({ success, data, message }, statusCode)`
- **Exception**: `PaymentController.midtransWebhook` menggunakan try-catch karena menangani webhook verification secara manual (SHA-512 signature verification)

### 5. Service (`service/*.service.ts`)
- **Pattern**: Static class methods
- **Tugas**: Business logic, existence check sebelum update/delete, orchestrate repository calls
- **Return**: Data langsung atau `null` untuk not-found cases
- **Khusus PaymentService**: Menangani integrasi Midtrans Snap, auto-update status order/reservation saat payment paid, dan caching pending payment (prevent duplicate Snap transaction)

### 6. Repository (`repository/*-read.repository.ts`, `repository/*-write.repository.ts`)
- **Pattern**: CQRS split (read/write terpisah), static class methods
- **Read**: Select queries, joins, filtering
- **Write**: Insert, update (dengan `updated_at: new Date()`), delete
- **Error handling**: try-catch dengan throw new Error untuk memberikan konteks pesan

---

## Sistem RBAC (Dynamic Permission)

Permission middleware (`src/middleware/permission.ts`) bekerja secara **dinamis**:

1. **Resolve path**: Extract `/api/{resource}` dari `c.req.path` → menjadi `permissionPath`
2. **Resolve action**: Map HTTP method ke permission flag:
   - `GET` → `can_read`
   - `POST` → `can_create`
   - `PUT/PATCH` → `can_update`
   - `DELETE` → `can_delete`
3. **Lookup**: Query `role_permissions` JOIN `menus` WHERE `role_id` = user's role AND `menus.permission_path` = resolved path
4. **Check**: Jika permission flag bernilai `true` → `next()`, jika tidak → `403 Forbidden`

**Implikasi saat menambah module baru:**
- Harus menambahkan entry di tabel `menus` dengan `permission_path` yang sesuai (contoh: `/api/new-feature`)
- Harus menambahkan `role_permissions` untuk setiap role yang perlu akses

---

## Integrasi Pihak Ketiga (Third-Party)

Sistem backend ini terhubung dengan dua layanan eksternal utama untuk proses transaksional:

### 1. Midtrans (Payment Gateway)
- **File Konfigurasi**: `src/lib/midtrans.ts`
- Digunakan untuk men-generate `snap_token` (QRIS/E-Wallet/Bank Transfer)
- Memiliki sistem **Webhook** (`/api/payments/webhook`) yang memverifikasi signature key (SHA-512) secara manual untuk memastikan keamanan dan mencegah transaksi duplikat.
- Mendukung pembaruan otomatis (auto-update status) pada tabel `dish_orders` dan `reservations` ketika pembayaran Midtrans berhasil diselesaikan (`settlement`).
- Selain Midtrans, juga ada metode pembayaran **Cash** yang otomatis berstatus `paid`.

### 2. Fonnte (WhatsApp API)
- **File Konfigurasi**: `src/lib/fonnte.ts`
- Digunakan untuk mengirimkan pesan/notifikasi WhatsApp ke pelanggan ketika transaksi (Pesanan Makanan atau Reservasi) berhasil dibayar (`settled` / `paid`).
- Dikirimkan secara asinkron di dalam service (saat webhook menerima konfirmasi `settlement` dari Midtrans atau saat kasir memproses metode Cash).
- Format struk dikirim dalam pesan rapi berbasis teks ke nomor telepon yang telah diinput pengguna (`customer_phone`).

---

## OpenAPI Documentation System

Sistem dokumentasi terdiri dari 3 lapisan:

### `openapi-common.ts` - Shared Helpers
- `protectedSecurity` - Security requirement array
- `timestampSchema` - Reusable datetime schema
- `createSuccessEnvelopeSchema()` - Buat response wrapper `{ success, data, message }`
- `apiErrorResponseSchema` - Schema error standar
- `createNumericPathParamsSchema()` - Helper path param `:id`
- `createCoercedIntSchema()` - Coerced integer helper
- `createOptionalCoercedIntSchema()` - Optional coerced integer helper
- `createNullableOptionalCoercedIntSchema()` - Nullable int helper untuk form fields
- `jsonContent()`, `jsonResponse()`, `errorResponses` - Response helper
- `createOpenApiRouter()` - Factory OpenAPIHono dengan Zod validation hook
- `registerOpenApiRoute()` - Bridge controller ke typed route
- `registerDefaultSecuritySchemes()` - Register BearerAuth + AppToken
- `createModuleOpenApiDocument()` - Generate per-module OpenAPI doc

### `openapi-schemas.ts` - Entity Schemas
Zod schemas untuk semua entity:
- **RBAC**: `roleSchema`, `menuSchema`, `userSchema`, `userRoleSummarySchema`, `navigationItemSchema`, `navigationPermissionSchema`, `rolePermissionSchema`
- **Upload**: `uploadSignatureResponseSchema`
- **Cafe**: `dishCategorySchema`, `dishSchema`, `dishImageSchema`, `dishOrderSchema`, `dishOrderDetailSchema`
- **Billiard**: `billiardTableTypeSchema`, `billiardTableSchema`, `billiardTableImageSchema`, `scheduleSchema`, `reservationSchema`
- **Transaction**: `paymentSchema`

Dipakai oleh response DTOs dan OpenAPI documentation.

### `openapi.ts` - Document Merger
- Mengumpulkan semua 16 module OpenAPI documents
- Mount paths dengan prefix (`/api/users`, `/api/roles`, dll.)
- Merge menjadi satu unified OpenAPI 3.0.3 document
- Served di `GET /openapi.json`, UI di `GET /docs`
- Tags: System, Users, Roles, Menus, Role Permissions, Uploads, Dish Categories, Dishes, Dish Images, Dish Orders, Dish Order Details, Billiard Table Types, Billiard Tables, Billiard Table Images, Schedules, Reservations, Payments

---

## Library Integrations

### `lib/midtrans.ts` - Midtrans Payment Gateway
- Membuat instance `Snap` dan `CoreApi` dari `midtrans-client`
- Konfigurasi via environment variables: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`
- `snap.createTransaction()` digunakan di `PaymentService.create()` untuk membuat Snap token
- Webhook handler memverifikasi signature SHA-512 dari Midtrans notification

---

## Environment Variables

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | Server port (default: 3000) |
| `APP_TOKEN` | Static token untuk header `X-App-Token` |
| `JWT_SECRET` | Secret key untuk JWT sign/verify |
| `ALLOWED_APP_URL` | Comma-separated allowed origins |
| `CLOUDINARY_URL` | Cloudinary connection URL |
| `CLOUDINARY_FOLDER` | Cloudinary upload folder (default: `uploads`) |
| `MIDTRANS_SERVER_KEY` | Midtrans server key untuk backend operations |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key untuk Snap widget |
| `MIDTRANS_IS_PRODUCTION` | `"true"` untuk production, default sandbox |

---

## NPM Scripts

| Script | Keterangan |
|---|---|
| `bun run dev` | Hot-reload development server |
| `bun run start` | Production server |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:push` | Push schema langsung ke DB (dev only) |
| `bun run db:studio` | Buka Drizzle Studio (DB GUI) |
| `bun run db:seed` | Jalankan seeder (reset + populate data awal) |

---

## API Endpoints

### Public
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/` | Welcome endpoint |
| `GET` | `/api/health` | Health check |
| `GET` | `/openapi.json` | OpenAPI specification |
| `GET` | `/docs` | Scalar API documentation UI |
| `POST` | `/api/users/login` | User authentication |
| `POST` | `/api/payments/webhook/midtrans` | Midtrans notification webhook |

### Protected (JWT + AppToken + Permission)
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/{id}` | Get user by ID |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/{id}` | Update user |
| `DELETE` | `/api/users/{id}` | Delete user |
| `GET` | `/api/roles` | List all roles |
| `GET` | `/api/roles/{id}` | Get role by ID |
| `POST` | `/api/roles` | Create role |
| `PUT` | `/api/roles/{id}` | Update role |
| `DELETE` | `/api/roles/{id}` | Delete role |
| `GET` | `/api/menus` | List all menus |
| `GET` | `/api/menus/{id}` | Get menu by ID |
| `POST` | `/api/menus` | Create menu |
| `PUT` | `/api/menus/{id}` | Update menu |
| `DELETE` | `/api/menus/{id}` | Delete menu |
| `GET` | `/api/role-permissions` | List all role permissions |
| `GET` | `/api/role-permissions/{id}` | Get role permission by ID |
| `POST` | `/api/role-permissions` | Create role permission |
| `PUT` | `/api/role-permissions/{id}` | Update role permission |
| `DELETE` | `/api/role-permissions/{id}` | Delete role permission |
| `GET/POST/PUT/DELETE` | `/api/dish-categories[/{id}]` | CRUD Dish Categories |
| `GET/POST/PUT/DELETE` | `/api/dishes[/{id}]` | CRUD Dishes |
| `GET/POST/PUT/DELETE` | `/api/dish-images[/{id}]` | CRUD Dish Images |
| `GET/POST/PUT/DELETE` | `/api/dish-orders[/{id}]` | CRUD Dish Orders |
| `GET/POST/PUT/DELETE` | `/api/dish-order-details[/{id}]` | CRUD Dish Order Details |
| `GET/POST/PUT/DELETE` | `/api/billiard-table-types[/{id}]` | CRUD Billiard Table Types |
| `GET/POST/PUT/DELETE` | `/api/billiard-tables[/{id}]` | CRUD Billiard Tables |
| `GET/POST/PUT/DELETE` | `/api/billiard-table-images[/{id}]` | CRUD Billiard Table Images |
| `GET/POST/PUT/DELETE` | `/api/schedules[/{id}]` | CRUD Schedules |
| `GET/POST/PUT/DELETE` | `/api/reservations[/{id}]` | CRUD Reservations |
| `GET/POST/PUT/DELETE` | `/api/payments[/{id}]` | CRUD Payments |

### Protected (JWT + AppToken, tanpa Permission check)
| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/api/users/me/navigation` | Navigation tree (hanya butuh auth) |
| `POST` | `/api/uploads/signature` | Upload signature (hanya butuh auth) |

---

## Seed Data

Seeder (`src/db/seed.ts`) membuat data awal:

- **Roles**: `ADMIN` (Administrator), `USER` (User)
- **Users**: `admin@example.com` (role: ADMIN), `user@example.com` (role: USER) — password: `password123`
- **Menus** (hierarchical):
  - Dashboard `/dashboard`
  - Master Data *(parent group)*
    - Role `/master-data/roles` → permission_path: `/api/roles`
    - User `/master-data/users` → permission_path: `/api/users`
  - Web Management *(parent group)*
    - Menu `/web-management/menus` → permission_path: `/api/menus`
    - Role Permission `/web-management/role-permissions` → permission_path: `/api/role-permissions`
  - Cafe Management *(parent group)*
    - Dish Categories `/cafe/dish-categories` → permission_path: `/api/dish-categories`
    - Dishes `/cafe/dishes` → permission_path: `/api/dishes`
    - Dish Images `/cafe/dish-images` → permission_path: `/api/dish-images` *(is_visible: false - tersembunyi dari navigasi, hanya untuk cek RBAC di Modal Galeri)*
    - Dish Orders `/cafe/dish-orders` → permission_path: `/api/dish-orders`
    - Dish Order Details `/cafe/dish-order-details` → permission_path: `/api/dish-order-details` *(is_visible: false - nested di menu Orders)*
  - Billiard Management *(parent group)*
    - Billiard Table Types `/billiard/table-types` → permission_path: `/api/billiard-table-types`
    - Billiard Tables `/billiard/tables` → permission_path: `/api/billiard-tables`
    - Billiard Table Images `/billiard/table-images` → permission_path: `/api/billiard-table-images` *(is_visible: false)*
    - Schedules `/billiard/schedules` → permission_path: `/api/schedules`
    - Reservations `/billiard/reservations` → permission_path: `/api/reservations`
  - Transaction *(parent group)*
    - Payments `/transaction/payments` → permission_path: `/api/payments`
- **Role Permissions**: Admin mendapat full access (semua `can_*` = true) ke semua menu

---

## Teknologi & Dependencies

| Kategori | Package | Versi | Keterangan |
|---|---|---|---|
| **Framework** | `hono` | ^4.12.9 | Lightweight web framework |
| **Validation** | `zod` | ^4.3.6 | Schema validation |
| **OpenAPI** | `@hono/zod-openapi` | ^1.3.0 | Zod ↔ OpenAPI bridge |
| **API Docs** | `@scalar/hono-api-reference` | ^0.10.14 | Interactive API docs UI |
| **Database** | `drizzle-orm` | ^0.45.1 | TypeScript ORM |
| **DB Driver** | `mysql2` | ^3.20.0 | MySQL driver |
| **Auth** | `jsonwebtoken` | ^9.0.3 | JWT handling |
| **Hashing** | `bcryptjs` | ^3.0.3 | Password hashing |
| **Upload** | `cloudinary` | ^2.9.0 | Cloud image management |
| **Payment** | `midtrans-client` | ^1.4.3 | Midtrans payment gateway SDK |
| **Env** | `dotenv` | ^17.3.1 | Environment variables |
| **Dev** | `drizzle-kit` | ^0.31.10 | DB migration tooling |
| **Dev** | `tsx` | ^4.21.0 | TypeScript execution |
| **Dev Types** | `@types/midtrans-client` | ^1.4.0 | Midtrans type definitions |
| **Dev Types** | `@types/node` | ^25.7.0 | Node.js type definitions |
| **Runtime** | `bun` | 1.3 | JavaScript runtime |
