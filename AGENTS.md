# AGENTS.md — Panduan AI Agent untuk Backend Portfolio (Hono & Bun)

> File ini berisi instruksi, konvensi arsitektur, dan aturan wajib yang harus ditaati oleh AI Agent saat memodifikasi atau mengembangkan codebase ini.

---

## 1. Wajib Baca Terlebih Dahulu
Sebelum melakukan perubahan kode:
1. Baca [README.md](./README.md) untuk informasi umum dan setup lingkungan.
2. Baca [STRUCTURE.md](./STRUCTURE.md) untuk memahami skema database, daftar tabel, dan pembagian modul di `src/app/`.

---

## 2. Tech Stack & Runtime Rules

| Aspek | Ketentuan |
|---|---|
| **Runtime** | **Bun** (jangan gunakan `node`, `npm`, atau `yarn`) |
| **Framework** | **Hono.js** (v4.x) |
| **Database** | **MySQL** via **Drizzle ORM** |
| **Validasi** | **Zod** |
| **Auth** | **JWT** (`jsonwebtoken`) + `bcryptjs` |
| **Storage** | **Cloudinary** (signed upload signature pattern) |
| **Dev Command** | `bun run dev` (berjalan di port `7000`) |

---

## 3. Konvensi Penulisan Modul (`src/app/{module}/`)

Setiap modul di dalam `src/app/` mengelompokkan logika domain:
```
src/app/{module_name}/
├── controller/
│   └── {module}.controller.ts      # HTTP request handler
└── route/
    └── {module}.route.ts           # Definisi endpoint Hono & middleware
```

### Aturan Controller & Endpoint:
1. **Response Envelope Konsisten**:
   - Berhasil:
     ```typescript
     return c.json({ success: true, data: result });
     ```
   - Berhasil dengan pesan / pagination:
     ```typescript
     return c.json({ success: true, message: "Berhasil disimpan", data: result });
     ```
   - Gagal / Error:
     ```typescript
     return c.json({ success: false, message: error.message || "Deskripsi error" }, statusCode);
     ```

2. **Type Safety Parameter & Drizzle ORM**:
   - Selalu validasi parameter URL sebelum query ke database:
     ```typescript
     const slugOrId = c.req.param("slug");
     if (!slugOrId) {
       return c.json({ success: false, message: "Parameter diperlukan" }, 400);
     }
     const isNumeric = /^\d+$/.test(slugOrId);
     const [record] = isNumeric
       ? await db.select().from(table).where(eq(table.id, Number(slugOrId))).limit(1)
       : await db.select().from(table).where(eq(table.slug, String(slugOrId))).limit(1);
     ```
   - Hindari meneruskan variabel yang mungkin bernilai `undefined` ke dalam fungsi Drizzle seperti `eq(column, value)`.

3. **Penyimpanan Konten Rich-Text / HTML**:
   - Kolom `full_description` (pada tabel `projects`) dan `content` (pada tabel `blogs`) menyimpan format HTML semantik dari WYSIWYG editor (Tiptap).
   - Saat menghitung waktu baca (*read time*), selalu bersihkan tag HTML terlebih dahulu:
     ```typescript
     function calculateReadTime(content: string): string {
       if (!content) return "1 min read";
       const clean = content.replace(/<[^>]*>/g, " ").trim();
       const words = clean.split(/\s+/).filter(Boolean).length;
       const minutes = Math.max(1, Math.ceil(words / 200));
       return `${minutes} min read`;
     }
     ```

4. **Autentikasi & Proteksi Endpoint**:
   - Endpoint publik (*read-only*) didaftarkan tanpa middleware auth (misal: `GET /api/projects`, `GET /api/blogs`).
   - Endpoint mutasi (POST, PUT, DELETE) **wajib** dilindungi oleh `jwtMiddleware`:
     ```typescript
     router.post("/", jwtMiddleware, BlogController.create);
     router.put("/:id", jwtMiddleware, BlogController.update);
     router.delete("/:id", jwtMiddleware, BlogController.delete);
     ```

5. **JSON Field Serialization**:
   - Kolom bertipe `text()` yang menyimpan JSON (seperti `tags`, `metrics`, `architecture_points`, `skills`, `features`) harus diparse sebelum dikirim ke response JSON jika disimpan sebagai string JSON, atau gunakan helper serializer yang rapi.

---

## 4. Database Schema Guidelines (`src/db/schema.ts`)
- Ketika menambahkan atau mengubah kolom database, gunakan tipe MySQL dari `drizzle-orm/mysql-core`.
- Terapkan `bun run db:push` untuk sinkronisasi skema langsung ke database dev, atau `bun run db:generate` && `bun run db:migrate` untuk migrasi bertahap.
- Jangan mengubah struktur tabel RBAC inti (`users`, `roles`, `menus`, `role_permissions`) tanpa memastikan kompatibilitas middleware RBAC.
