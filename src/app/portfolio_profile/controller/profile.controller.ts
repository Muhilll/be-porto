import { Context } from "hono";
import { db } from "../../../db/connection";
import { profiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class ProfileController {
  /**
   * GET /api/profile
   * Public: returns current profile
   */
  static async get(c: Context) {
    try {
      const [record] = await db.select().from(profiles).limit(1);

      if (!record) {
        return c.json({
          success: true,
          message: "Profile not found",
          data: null,
        });
      }

      // Parse JSON fields
      const parsedData = {
        ...record,
        roles_list: record.roles_list ? JSON.parse(record.roles_list) : [],
        stats: record.stats ? JSON.parse(record.stats) : [],
      };

      return c.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to fetch profile",
        },
        500
      );
    }
  }

  /**
   * PUT /api/profile
   * Protected: updates or creates profile
   */
  static async upsert(c: Context) {
    try {
      const body = await c.req.json();

      const rolesListStr = body.roles_list ? JSON.stringify(body.roles_list) : null;
      const statsStr = body.stats ? JSON.stringify(body.stats) : null;

      const profilePayload = {
        name: body.name || "Zail Yan Zali",
        short_name: body.short_name || "Zail",
        role: body.role || "Full-Stack Software Engineer",
        roles_list: rolesListStr,
        tagline: body.tagline || "",
        bio: body.bio || "",
        location: body.location || "",
        availability: body.availability || "available",
        availability_text: body.availability_text || "",
        avatar_url: body.avatar_url || "",
        resume_url: body.resume_url || "",
        email: body.email || "",
        github: body.github || "",
        linkedin: body.linkedin || "",
        whatsapp: body.whatsapp || "",
        stats: statsStr,
        updated_at: new Date(),
      };

      const [existing] = await db.select().from(profiles).limit(1);

      if (existing) {
        await db.update(profiles).set(profilePayload).where(eq(profiles.id, existing.id));
      } else {
        await db.insert(profiles).values({
          ...profilePayload,
          created_at: new Date(),
        });
      }

      const [updated] = await db.select().from(profiles).limit(1);
      const parsedUpdated = {
        ...updated,
        roles_list: updated.roles_list ? JSON.parse(updated.roles_list) : [],
        stats: updated.stats ? JSON.parse(updated.stats) : [],
      };

      return c.json({
        success: true,
        message: "Profile saved successfully",
        data: parsedUpdated,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to update profile",
        },
        500
      );
    }
  }
}
