import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import path from "path";
import fs from "fs";

// Initialize Cloudinary if CLOUDINARY_URL is present
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
}

/**
 * Upload buffer or base64 to Cloudinary with local storage fallback
 */
export async function uploadMedia(
  fileBuffer: Buffer | ArrayBuffer,
  fileName: string,
  folder = process.env.CLOUDINARY_FOLDER || "portfolio"
): Promise<UploadResult> {
  const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

  // If Cloudinary is configured, try Cloudinary first
  if (process.env.CLOUDINARY_URL) {
    try {
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
            });
          }
        );
        uploadStream.end(buffer);
      });

      return result;
    } catch (cloudinaryError) {
      console.warn(
        "Cloudinary upload failed, automatically falling back to local file storage:",
        cloudinaryError
      );
      // Fallback proceeds below to local ./public/uploads
    }
  }


  // Fallback: Local upload to ./public/uploads
  const publicDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const ext = path.extname(fileName) || ".png";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(publicDir, uniqueName);
  fs.writeFileSync(filePath, buffer);

  const port = process.env.PORT || 7000;
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
  return {
    url: `${baseUrl}/uploads/${uniqueName}`,
  };
}
