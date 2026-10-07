import { Context } from "hono";
import { db } from "../../../db/connection";
import { services } from "../../../db/schema";
import { eq, asc } from "drizzle-orm";

function parseService(item: any) {
  if (!item) return null;
  return {
    ...item,
    features: item.features ? (typeof item.features === "string" ? JSON.parse(item.features) : item.features) : [],
  };
}

export class ServiceController {
  static async getAll(c: Context) {
    try {
      const rows = await db
        .select()
        .from(services)
        .orderBy(asc(services.sort_order), asc(services.id));

      return c.json({
        success: true,
        data: rows.map(parseService),
      });
    } catch (error: any) {
      console.error("Error fetching services:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch services" }, 500);
    }
  }

  static async getOne(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [record] = await db.select().from(services).where(eq(services.id, id)).limit(1);
      if (!record) {
        return c.json({ success: false, message: "Service not found" }, 404);
      }
      return c.json({ success: true, data: parseService(record) });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to fetch service" }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.title || !body.number) {
        return c.json({ success: false, message: "Title and number are required" }, 400);
      }

      const featuresStr = body.features ? JSON.stringify(body.features) : JSON.stringify([]);

      const insertValues = {
        service_code: body.service_code || null,
        number: body.number,
        title: body.title,
        description: body.description || "",
        icon: body.icon || "Layout",
        features: featuresStr,
        deliverables: body.deliverables || "",
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(services).values(insertValues);
      const [created] = await db.select().from(services).where(eq(services.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Service created successfully",
        data: parseService(created),
      }, 201);
    } catch (error: any) {
      console.error("Error creating service:", error);
      return c.json({ success: false, message: error.message || "Failed to create service" }, 500);
    }
  }

  static async update(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Service not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.service_code !== undefined) updateValues.service_code = body.service_code;
      if (body.number !== undefined) updateValues.number = body.number;
      if (body.title !== undefined) updateValues.title = body.title;
      if (body.description !== undefined) updateValues.description = body.description;
      if (body.icon !== undefined) updateValues.icon = body.icon;
      if (body.features !== undefined) updateValues.features = JSON.stringify(body.features);
      if (body.deliverables !== undefined) updateValues.deliverables = body.deliverables;
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      await db.update(services).set(updateValues).where(eq(services.id, id));
      const [updated] = await db.select().from(services).where(eq(services.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Service updated successfully",
        data: parseService(updated),
      });
    } catch (error: any) {
      console.error("Error updating service:", error);
      return c.json({ success: false, message: error.message || "Failed to update service" }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Service not found" }, 404);
      }

      await db.delete(services).where(eq(services.id, id));
      return c.json({ success: true, message: "Service deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting service:", error);
      return c.json({ success: false, message: error.message || "Failed to delete service" }, 500);
    }
  }
}
