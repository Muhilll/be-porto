import { Hono } from "hono";
import { jwtMiddleware } from "../../../middleware/auth";
import { uploadMedia } from "../../../utils/cloudinary";

const router = new Hono();

// POST /api/upload
router.post("/", jwtMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"] || body["image"];

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          message: "No valid file uploaded. Field 'file' or 'image' is required.",
        },
        400
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadMedia(arrayBuffer, file.name);

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
