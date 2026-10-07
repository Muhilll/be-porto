import { Context } from "hono";
import { db } from "../../../db/connection";
import { certificates } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

function parseCertificate(item: any) {
  if (!item) return null;
  return {
    ...item,
    skills: item.skills ? (typeof item.skills === "string" ? JSON.parse(item.skills) : item.skills) : [],
  };
}

export class CertificateController {
  static async getAll(c: Context) {
    try {
      const rows = await db
        .select()
        .from(certificates)
        .orderBy(desc(certificates.sort_order), desc(certificates.id));

      return c.json({
        success: true,
        data: rows.map(parseCertificate),
      });
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch certificates" }, 500);
    }
  }

  static async getOne(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [record] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
      if (!record) {
        return c.json({ success: false, message: "Certificate not found" }, 404);
      }
      return c.json({ success: true, data: parseCertificate(record) });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to fetch certificate" }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.title || !body.issuer || !body.image) {
        return c.json({ success: false, message: "Title, issuer, and image are required" }, 400);
      }

      const skillsStr = body.skills ? JSON.stringify(body.skills) : JSON.stringify([]);

      const insertValues = {
        title: body.title,
        issuer: body.issuer,
        issuer_logo: body.issuer_logo || null,
        issue_date: body.issue_date || new Date().getFullYear().toString(),
        expiry_date: body.expiry_date || null,
        credential_id: body.credential_id || null,
        credential_url: body.credential_url || null,
        image: body.image,
        skills: skillsStr,
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(certificates).values(insertValues);
      const [created] = await db.select().from(certificates).where(eq(certificates.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Certificate created successfully",
        data: parseCertificate(created),
      }, 201);
    } catch (error: any) {
      console.error("Error creating certificate:", error);
      return c.json({ success: false, message: error.message || "Failed to create certificate" }, 500);
    }
  }

  static async update(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Certificate not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.title !== undefined) updateValues.title = body.title;
      if (body.issuer !== undefined) updateValues.issuer = body.issuer;
      if (body.issuer_logo !== undefined) updateValues.issuer_logo = body.issuer_logo;
      if (body.issue_date !== undefined) updateValues.issue_date = body.issue_date;
      if (body.expiry_date !== undefined) updateValues.expiry_date = body.expiry_date;
      if (body.credential_id !== undefined) updateValues.credential_id = body.credential_id;
      if (body.credential_url !== undefined) updateValues.credential_url = body.credential_url;
      if (body.image !== undefined) updateValues.image = body.image;
      if (body.skills !== undefined) updateValues.skills = JSON.stringify(body.skills);
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      await db.update(certificates).set(updateValues).where(eq(certificates.id, id));
      const [updated] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Certificate updated successfully",
        data: parseCertificate(updated),
      });
    } catch (error: any) {
      console.error("Error updating certificate:", error);
      return c.json({ success: false, message: error.message || "Failed to update certificate" }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Certificate not found" }, 404);
      }

      await db.delete(certificates).where(eq(certificates.id, id));
      return c.json({ success: true, message: "Certificate deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      return c.json({ success: false, message: error.message || "Failed to delete certificate" }, 500);
    }
  }
}
