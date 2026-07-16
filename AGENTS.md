# AGENTS.md — Panduan AI Agent untuk Project ini

> File ini berisi instruksi dan konvensi yang **WAJIB** diikuti oleh AI assistant saat bekerja pada project ini. Baca file ini di awal setiap conversation.

---

## 1. Baca STRUCTURE.md Terlebih Dahulu

Sebelum mengerjakan task apapun, **WAJIB baca `STRUCTURE.md`** untuk memahami:
- Arsitektur module-based layered
- Database schema dan relasi (16 tabel)
- Alur request dan middleware chain
- Pola coding yang digunakan
- Sistem RBAC dinamis
- Integrasi Midtrans payment gateway

---

## 2. Tech Stack & Runtime

| Aspek | Detail |
|---|---|
| **Runtime** | Bun (bukan Node.js) |
| **Framework** | Hono.js |
| **Database** | MySQL + Drizzle ORM |
| **Validation** | Zod via `@hono/zod-openapi` |
| **API Docs** | OpenAPI 3.0.3 + Scalar |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Upload** | Cloudinary (signed upload pattern) |
| **Payment** | Midtrans (Snap + Core API via `midtrans-client`) |
| **Deployment** | Vercel (serverless) |

**Penting:**
- Gunakan `bun` untuk semua command, **bukan** `npm` atau `yarn`
- Entry point: `src/index.ts`, di-export sebagai `export default app` untuk Vercel

---

## 3. Konvensi Saat Menambah Module Baru

Saat membuat module/fitur baru, ikuti **6-layer pattern** ini secara konsisten:

### Struktur Folder
```
src/app/{module_name}/
├── contract/
│   └── {module}.contract.ts        # Type definitions (TypeScript types)
├── dto/
│   ├── {module}-request.dto.ts      # Zod schemas untuk request validation
│   └── {module}-response.dto.ts     # Zod schemas untuk response envelope
├── route/
│   ├── {module}.openapi.ts          # Route definitions (createRoute)
│   └── {module}.route.ts            # Router setup + middleware registration
├── controller/
│   └── {module}.controller.ts       # HTTP handlers (static class methods)
├── service/
│   └── {module}.service.ts          # Business logic (static class methods)
└── repository/
    ├── {module}-read.repository.ts   # SELECT queries
    └── {module}-write.repository.ts  # INSERT/UPDATE/DELETE queries
```

### Naming Convention
- **Folder module**: `snake_case` (contoh: `role_permission`)
- **File**: `kebab-case` (contoh: `role-permission-read.repository.ts`)
- **Class**: `PascalCase` (contoh: `RolePermissionReadRepository`)
- **Zod schema**: `camelCase` + deskriptif (contoh: `createMenuRequestSchema`)
- **OpenAPI name**: `PascalCase` (contoh: `"CreateMenuRequest"`)
- **Route variable**: `camelCase` + `Route` suffix (contoh: `getAllMenusRoute`)

---

## 4. Pattern Wajib per Layer

### 4.1 Contract
```typescript
export type XxxEntity = {
  id: number;
  name: string;
  // ... mirror kolom database
  created_at: Date;
  updated_at: Date;
};
```

### 4.2 Request DTO
```typescript
import { z } from "@hono/zod-openapi";

export const createXxxRequestSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Example" }),
    // ... fields
  })
  .openapi("CreateXxxRequest");

export const updateXxxRequestSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: "Updated" }),
    // ... optional fields
  })
  .openapi("UpdateXxxRequest");

export type CreateXxxRequestDto = z.infer<typeof createXxxRequestSchema>;
export type UpdateXxxRequestDto = z.infer<typeof updateXxxRequestSchema>;
```

### 4.3 Response DTO
```typescript
import { z } from "@hono/zod-openapi";
import { createSuccessEnvelopeSchema, writeResultSchema } from "../../../docs/openapi-common";
import { xxxSchema } from "../../../docs/openapi-schemas";

export type XxxResponseDto = XxxEntity;

export const xxxListResponseSchema = createSuccessEnvelopeSchema(
  "XxxListResponse", z.array(xxxSchema), "Xxx fetched successfully"
);
export const xxxDetailResponseSchema = createSuccessEnvelopeSchema(
  "XxxDetailResponse", xxxSchema, "Xxx fetched successfully"
);
export const xxxMutationResponseSchema = createSuccessEnvelopeSchema(
  "XxxMutationResponse", writeResultSchema, "Xxx created successfully"
);
```

### 4.4 OpenAPI Route Definition
```typescript
import { createRoute } from "@hono/zod-openapi";
import { protectedSecurity, errorResponses, jsonResponse, createNumericPathParamsSchema } from "../../../docs/openapi-common";

const tags = ["XxxModule"];
const xxxIdParamsSchema = createNumericPathParamsSchema("id");

export const getAllXxxRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get all xxx",
  security: protectedSecurity,
  responses: {
    200: jsonResponse(xxxListResponseSchema, "Xxx fetched successfully"),
    401: errorResponses[401],
    403: errorResponses[403],
    500: errorResponses[500],
  },
});
// ... createRoute untuk getById, create, update, delete
```

### 4.5 Route Setup
```typescript
import { createModuleOpenApiDocument, createOpenApiRouter, registerOpenApiRoute, registerDefaultSecuritySchemes } from "../../../docs/openapi-common";
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { requirePermission } from "../../../middleware/permission";

const router = createOpenApiRouter();
registerDefaultSecuritySchemes(router);

// Global middleware untuk module ini
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());

registerOpenApiRoute(router, getAllXxxRoute, XxxController.getAll);
// ... register semua route

export function getXxxOpenApiDocument(baseUrl: string) {
  return createModuleOpenApiDocument(router, baseUrl, "Xxx API");
}

export default router;
```

**Pola Hybrid (campuran public + protected):**
```typescript
// Contoh: payment module — webhook public, CRUD protected
const router = createOpenApiRouter();
registerDefaultSecuritySchemes(router);

// 1. Register PUBLIC routes SEBELUM middleware
registerOpenApiRoute(router, publicWebhookRoute, Controller.webhook);

// 2. Apply middleware SETELAH public routes
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());

// 3. Register PROTECTED routes
registerOpenApiRoute(router, getAllRoute, Controller.getAll);
```

### 4.6 Controller
```typescript
export class XxxController {
  static async getAll(c: Context) {
    const items = await XxxService.getAll();
    return c.json({ success: true, data: items, message: "Xxx fetched successfully" });
  }

  static async getById(c: Context) {
    const id = Number(c.req.param("id"));
    const item = await XxxService.getById(id);
    if (!item) return c.json({ success: false, message: "Xxx not found" }, 404);
    return c.json({ success: true, data: item, message: "Xxx fetched successfully" });
  }

  static async create(c: Context) {
    const body: CreateXxxRequestDto = await c.req.json();
    const result = await XxxService.create(body);
    return c.json({ success: true, data: result, message: "Xxx created successfully" }, 201);
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));
    const body: UpdateXxxRequestDto = await c.req.json();
    const updateResult = await XxxService.update(id, body);
    if (!updateResult) return c.json({ success: false, message: "Xxx not found" }, 404);
    return c.json({ success: true, data: updateResult.result, message: "Xxx updated successfully" });
  }

  static async delete(c: Context) {
    const id = Number(c.req.param("id"));
    const deleteResult = await XxxService.delete(id);
    if (!deleteResult) return c.json({ success: false, message: "Xxx not found" }, 404);
    return c.json({ success: true, data: deleteResult.result, message: "Xxx deleted successfully" });
  }
}
```

**PENTING:** Controller **TIDAK** boleh punya try-catch manual. Error ditangani oleh global error handler di `middleware/errorHandler.ts`.
**EXCEPTION:** Webhook handlers (seperti `PaymentController.midtransWebhook`) boleh menggunakan try-catch karena menangani verifikasi signature secara manual.

### 4.7 Service
```typescript
export class XxxService {
  static async getAll() {
    return XxxReadRepository.getAll();
  }

  static async getById(id: number) {
    return XxxReadRepository.getById(id);
  }

  static async create(payload: CreateXxxRequestDto) {
    return XxxWriteRepository.create(payload);
  }

  static async update(id: number, payload: UpdateXxxRequestDto) {
    const item = await XxxReadRepository.getById(id);
    if (!item) return null;
    const result = await XxxWriteRepository.update(id, payload);
    return { item, result };
  }

  static async delete(id: number) {
    const item = await XxxReadRepository.getById(id);
    if (!item) return null;
    const result = await XxxWriteRepository.delete(id);
    return { item, result };
  }
}
```

### 4.8 Repository (CQRS)
```typescript
// Read Repository
export class XxxReadRepository {
  static async getAll() {
    try {
      return await db.select().from(xxx);
    } catch (error) {
      throw new Error(`Failed to fetch xxx: ${error}`);
    }
  }

  static async getById(id: number) {
    try {
      const result = await db.select().from(xxx).where(eq(xxx.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch xxx: ${error}`);
    }
  }
}

// Write Repository
export class XxxWriteRepository {
  static async create(data: CreateXxxRequestDto) {
    try {
      return await db.insert(xxx).values(data);
    } catch (error) {
      throw new Error(`Failed to create xxx: ${error}`);
    }
  }

  static async update(id: number, data: UpdateXxxRequestDto) {
    try {
      return await db.update(xxx).set({ ...data, updated_at: new Date() }).where(eq(xxx.id, id));
    } catch (error) {
      throw new Error(`Failed to update xxx: ${error}`);
    }
  }

  static async delete(id: number) {
    try {
      return await db.delete(xxx).where(eq(xxx.id, id));
    } catch (error) {
      throw new Error(`Failed to delete xxx: ${error}`);
    }
  }
}
```

---

## 5. Checklist Saat Menambah Module Baru

Setelah membuat 6 layer di atas, jangan lupa:

### A. Database
- [ ] Tambah tabel baru di `src/db/schema.ts`
- [ ] Jalankan `bun run db:generate` lalu `bun run db:migrate`

### B. OpenAPI Schemas
- [ ] Tambah entity schema di `src/docs/openapi-schemas.ts`

### C. Route Registration
- [ ] Import route di `src/index.ts`
- [ ] Mount route: `app.route('/api/{module}', xxxRoutes)`

### D. OpenAPI Document Merger
- [ ] Import `getXxxOpenApiDocument` di `src/docs/openapi.ts`
- [ ] Tambahkan ke `moduleDocuments` array dengan `mountOpenApiPaths()`
- [ ] Tambahkan tag baru ke `tags` array di `createBaseDocument()`

### E. RBAC / Permission
- [ ] Tambahkan entry di tabel `menus` dengan `permission_path: '/api/{module}'`
- [ ] Tambahkan `role_permissions` untuk setiap role yang perlu akses
- [ ] Update `seed.ts` jika perlu

---

## 6. Pola Middleware

### Tiga Strategi Middleware:

**A. Global Module Middleware** (di `*.route.ts`)
```typescript
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());
```
Gunakan ini ketika **semua endpoint** di module memerlukan auth + permission yang sama.
Contoh: module `menu`, `role`, `role_permission`, `schedule`, `dish_category`.

**B. Per-Endpoint Middleware** (di `*.openapi.ts`)
```typescript
export const someRoute = createRoute({
  // ...
  middleware: [jwtMiddleware, appTokenMiddleware, requirePermission()] as const,
  // ...
});
```
Gunakan ini ketika module punya campuran endpoint public dan protected.
Contoh: module `user` (login public, CRUD protected).

**C. Hybrid (Public + Protected di route.ts)**
```typescript
// Register public routes SEBELUM middleware
registerOpenApiRoute(router, publicRoute, Controller.publicHandler);
// Apply middleware global
router.use("*", jwtMiddleware, appTokenMiddleware, requirePermission());
// Register protected routes SETELAH middleware
registerOpenApiRoute(router, protectedRoute, Controller.protectedHandler);
```
Gunakan ini ketika module punya webhook atau endpoint public yang tidak memerlukan auth sama sekali.
Contoh: module `payment` (Midtrans webhook public, CRUD protected).

---

## 7. Response Format

Semua API response mengikuti format envelope yang konsisten:

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Action performed successfully"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "field_name": ["Error message"]
    }
  }
}
```

---

## 8. Import Conventions

```typescript
// Database
import { db } from "../../../db";
import { tableName } from "../../../db/schema";
// atau
import { db, tableName } from "../../../db";

// Middleware
import { jwtMiddleware } from "../../../middleware/auth";
import { appTokenMiddleware } from "../../../middleware/appToken";
import { requirePermission } from "../../../middleware/permission";

// OpenAPI helpers
import {
  createOpenApiRouter,
  registerOpenApiRoute,
  registerDefaultSecuritySchemes,
  createModuleOpenApiDocument,
  createSuccessEnvelopeSchema,
  createNumericPathParamsSchema,
  protectedSecurity,
  errorResponses,
  jsonResponse,
  writeResultSchema,
  apiErrorResponseSchema,
  timestampSchema,
} from "../../../docs/openapi-common";

// Entity schemas (untuk response DTOs)
import { xxxSchema } from "../../../docs/openapi-schemas";

// Drizzle operators
import { eq, and, isNull, isNotNull } from "drizzle-orm";

// Midtrans (jika perlu integrasi payment)
import { snap, coreApi } from "../../../lib/midtrans";
```

---

## 9. Hal yang TIDAK Boleh Dilakukan

1. ❌ **Jangan** tambahkan try-catch di controller — sudah ditangani global error handler *(kecuali webhook handler yang perlu signature verification)*
2. ❌ **Jangan** validasi manual di controller — sudah ditangani Zod defaultHook
3. ❌ **Jangan** hardcode permission check — gunakan `requirePermission()` yang dinamis
4. ❌ **Jangan** gunakan `npm` atau `yarn` — gunakan `bun`
5. ❌ **Jangan** buat file migration manual — gunakan `bun run db:generate`
6. ❌ **Jangan** return response tanpa envelope `{ success, data/message }` — ikuti format standar
7. ❌ **Jangan** skip OpenAPI registration — semua endpoint harus terdokumentasi

---

## 10. Hal yang WAJIB Dilakukan

1. ✅ Baca `STRUCTURE.md` di awal setiap conversation
2. ✅ Ikuti 6-layer pattern secara konsisten
3. ✅ Gunakan CQRS (read/write repository terpisah)
4. ✅ Register semua route baru di `index.ts` dan `openapi.ts`
5. ✅ Tambahkan entity schema baru di `openapi-schemas.ts`
6. ✅ Update seed data jika menambah menu/permission baru
7. ✅ Gunakan `static` methods untuk semua class (Controller, Service, Repository)
8. ✅ Sertakan `updated_at: new Date()` pada semua update operations
9. ✅ Gunakan `openapi()` method pada setiap Zod schema yang diekspos ke API
10. ✅ Export `getXxxOpenApiDocument()` dari setiap module route
