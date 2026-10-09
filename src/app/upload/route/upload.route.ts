import { Hono, Context, Next } from "hono";
import { verifyToken } from "../../../utils/jwt";
import { uploadMedia } from "../../../utils/cloudinary";

const router = new Hono();

/**
 * Upload auth middleware:
 * Mengizinkan upload jika request memiliki JWT token valid (user terautentikasi)
 * ATAU X-App-Token valid yang berasal dari frontend terdaftar.
 */
const uploadAuthMiddleware = async (c: Context, next: Next) => {
  const authorization = c.req.header("Authorization");
  const appToken = c.req.header("X-App-Token");
  const expectedAppToken = process.env.APP_TOKEN;

  // 1. Cek JWT Bearer token
  if (authorization) {
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        c.set("user", payload);
        return await next();
      }
    }
  }

  // 2. Cek App Token
  if (appToken && expectedAppToken && appToken === expectedAppToken) {
    return await next();
  }

  return c.json(
    {
      success: false,
      message: "Unauthorized - Autentikasi diperlukan untuk mengunggah file.",
    },
    401
  );
};

// POST /api/upload
router.post("/", uploadAuthMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const rawFile = body["file"] || body["image"];

    if (!rawFile || typeof rawFile === "string" || Array.isArray(rawFile) || !(rawFile instanceof File)) {
      return c.json(
        {
          success: false,
          message: "Tidak ada file yang diunggah. Mohon pilih file gambar yang valid.",
        },
        400
      );
    }

    const file: File = rawFile;

    // Limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      return c.json(
        {
          success: false,
          message: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 10MB.",
        },
        400
      );
    }

    const fileName = file.name || `upload-${Date.now()}.png`;
    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadMedia(arrayBuffer, fileName);


    return c.json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json(
      {
        success: false,
        message: error.message || "Failed to upload file",
      },
      500
    );
  }
});


export default router;
