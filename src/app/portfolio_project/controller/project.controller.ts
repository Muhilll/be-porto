import { Context } from "hono";
import { db } from "../../../db/connection";
import { projects } from "../../../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

function parseProject(item: any) {
  if (!item) return null;
  return {
    ...item,
    tags: item.tags ? (typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags) : [],
    metrics: item.metrics ? (typeof item.metrics === "string" ? JSON.parse(item.metrics) : item.metrics) : [],
    architecture_points: item.architecture_points
      ? typeof item.architecture_points === "string"
        ? JSON.parse(item.architecture_points)
        : item.architecture_points
      : [],
  };
}

export class ProjectController {
  /**
   * GET /api/projects
   * Public: list all projects with optional filters
   */
  static async getAll(c: Context) {
    try {
      const category = c.req.query("category");
      const featured = c.req.query("featured");

      const conditions = [];

      if (category && category !== "All") {
        conditions.push(eq(projects.category, category));
      }

      if (featured === "true") {
        conditions.push(eq(projects.featured, true));
      }

      const rows =
        conditions.length > 0
          ? await db
              .select()
              .from(projects)
              .where(and(...conditions))
              .orderBy(desc(projects.sort_order), desc(projects.created_at))
          : await db
              .select()
              .from(projects)
              .orderBy(desc(projects.sort_order), desc(projects.created_at));

      return c.json({
        success: true,
        data: rows.map(parseProject),
      });
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to fetch projects",
        },
        500
      );
    }
  }

  /**
   * GET /api/projects/:idOrSlug
   */
  static async getOne(c: Context) {
    try {
      const idOrSlug = c.req.param("idOrSlug");
      if (!idOrSlug) {
        return c.json({ success: false, message: "idOrSlug is required" }, 400);
      }
      const isNumeric = /^\d+$/.test(idOrSlug);

      const [record] = isNumeric
        ? await db.select().from(projects).where(eq(projects.id, Number(idOrSlug))).limit(1)
        : await db.select().from(projects).where(eq(projects.slug, String(idOrSlug))).limit(1);

      if (!record) {
        return c.json(
          {
            success: false,
            message: "Project not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        data: parseProject(record),
      });
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to fetch project",
        },
        500
      );
    }
  }

  /**
   * POST /api/projects
   */
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.title || !body.category || !body.image_url) {
        return c.json(
          {
            success: false,
            message: "Title, category, and image_url are required",
          },
          400
        );
      }

      const rawSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const finalSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;

      const tagsStr = body.tags ? JSON.stringify(body.tags) : JSON.stringify([]);
      const metricsStr = body.metrics ? JSON.stringify(body.metrics) : JSON.stringify([]);
      const archStr = body.architecture_points ? JSON.stringify(body.architecture_points) : JSON.stringify([]);

      const insertValues = {
        title: body.title,
        slug: body.slug || finalSlug,
        category: body.category,
        short_description: body.short_description || "",
        full_description: body.full_description || "",
        image_url: body.image_url,
        demo_url: body.demo_url || null,
        github_url: body.github_url || null,
        year: body.year || new Date().getFullYear().toString(),
        featured: Boolean(body.featured),
        tags: tagsStr,
        metrics: metricsStr,
        architecture_points: archStr,
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [insertResult] = await db.insert(projects).values(insertValues);
      const insertId = insertResult.insertId;

      const [created] = await db.select().from(projects).where(eq(projects.id, insertId)).limit(1);

      return c.json(
        {
          success: true,
          message: "Project created successfully",
          data: parseProject(created),
        },
        201
      );
    } catch (error: any) {
      console.error("Error creating project:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to create project",
        },
        500
      );
    }
  }

  /**
   * PUT /api/projects/:id
   */
  static async update(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Project not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.title !== undefined) updateValues.title = body.title;
      if (body.slug !== undefined) updateValues.slug = body.slug;
      if (body.category !== undefined) updateValues.category = body.category;
      if (body.short_description !== undefined) updateValues.short_description = body.short_description;
      if (body.full_description !== undefined) updateValues.full_description = body.full_description;
      if (body.image_url !== undefined) updateValues.image_url = body.image_url;
      if (body.demo_url !== undefined) updateValues.demo_url = body.demo_url;
      if (body.github_url !== undefined) updateValues.github_url = body.github_url;
      if (body.year !== undefined) updateValues.year = body.year;
      if (body.featured !== undefined) updateValues.featured = Boolean(body.featured);
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      if (body.tags !== undefined) updateValues.tags = JSON.stringify(body.tags);
      if (body.metrics !== undefined) updateValues.metrics = JSON.stringify(body.metrics);
      if (body.architecture_points !== undefined) updateValues.architecture_points = JSON.stringify(body.architecture_points);

      await db.update(projects).set(updateValues).where(eq(projects.id, id));

      const [updated] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Project updated successfully",
        data: parseProject(updated),
      });
    } catch (error: any) {
      console.error("Error updating project:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to update project",
        },
        500
      );
    }
  }

  /**
   * DELETE /api/projects/:id
   */
  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));

      const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Project not found" }, 404);
      }

      await db.delete(projects).where(eq(projects.id, id));

      return c.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Failed to delete project",
        },
        500
      );
    }
  }
}
