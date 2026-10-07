import { Context } from "hono";
import { db } from "../../../db/connection";
import { blogs } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

function parseBlog(item: any) {
  if (!item) return null;
  return {
    ...item,
    tags: item.tags ? (typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags) : [],
    featured: Boolean(item.featured),
    is_published: Boolean(item.is_published),
  };
}

function calculateReadTime(content: string): string {
  if (!content) return "1 min read";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrentDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export class BlogController {
  static async getAll(c: Context) {
    try {
      const showAll = c.req.query("all") === "true";

      const query = db.select().from(blogs);
      const rows = showAll
        ? await query.orderBy(desc(blogs.id))
        : await query.where(eq(blogs.is_published, true)).orderBy(desc(blogs.id));

      return c.json({
        success: true,
        data: rows.map(parseBlog),
      });
    } catch (error: any) {
      console.error("Error fetching blogs:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch blogs" }, 500);
    }
  }

  static async getBySlug(c: Context) {
    try {
      const param = c.req.param("slug");

      let record = null;
      // Check if param is numeric ID
      if (/^\d+$/.test(param)) {
        const [foundById] = await db
          .select()
          .from(blogs)
          .where(eq(blogs.id, Number(param)))
          .limit(1);
        record = foundById;
      }

      if (!record) {
        const [foundBySlug] = await db
          .select()
          .from(blogs)
          .where(eq(blogs.slug, param))
          .limit(1);
        record = foundBySlug;
      }

      if (!record) {
        return c.json({ success: false, message: "Article not found" }, 404);
      }

      return c.json({ success: true, data: parseBlog(record) });
    } catch (error: any) {
      console.error("Error fetching article by slug:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch article" }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.title || !body.content) {
        return c.json({ success: false, message: "Title and content are required" }, 400);
      }

      const slug = (body.slug?.trim() || generateSlug(body.title)) || `post-${Date.now()}`;

      // Check unique slug
      const [existingSlug] = await db
        .select()
        .from(blogs)
        .where(eq(blogs.slug, slug))
        .limit(1);

      const finalSlug = existingSlug ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;

      const tagsStr = body.tags ? JSON.stringify(body.tags) : JSON.stringify([]);
      const readTime = body.read_time || calculateReadTime(body.content);
      const publishedAt = body.published_at || formatCurrentDate();

      const insertValues = {
        slug: finalSlug,
        title: body.title,
        excerpt: body.excerpt || body.content.slice(0, 160).replace(/\n/g, " ") + "...",
        content: body.content,
        cover_image: body.cover_image || null,
        published_at: publishedAt,
        read_time: readTime,
        category: body.category || "General",
        tags: tagsStr,
        featured: Boolean(body.featured),
        is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(blogs).values(insertValues);
      const [created] = await db.select().from(blogs).where(eq(blogs.id, res.insertId)).limit(1);

      return c.json(
        {
          success: true,
          message: "Article created successfully",
          data: parseBlog(created),
        },
        201
      );
    } catch (error: any) {
      console.error("Error creating article:", error);
      return c.json({ success: false, message: error.message || "Failed to create article" }, 500);
    }
  }

  static async update(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Article not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.title !== undefined) updateValues.title = body.title;
      if (body.slug !== undefined) updateValues.slug = generateSlug(body.slug);
      if (body.excerpt !== undefined) updateValues.excerpt = body.excerpt;
      if (body.content !== undefined) {
        updateValues.content = body.content;
        if (!body.read_time) {
          updateValues.read_time = calculateReadTime(body.content);
        }
      }
      if (body.cover_image !== undefined) updateValues.cover_image = body.cover_image;
      if (body.published_at !== undefined) updateValues.published_at = body.published_at;
      if (body.read_time !== undefined) updateValues.read_time = body.read_time;
      if (body.category !== undefined) updateValues.category = body.category;
      if (body.tags !== undefined) updateValues.tags = JSON.stringify(body.tags);
      if (body.featured !== undefined) updateValues.featured = Boolean(body.featured);
      if (body.is_published !== undefined) updateValues.is_published = Boolean(body.is_published);

      await db.update(blogs).set(updateValues).where(eq(blogs.id, id));
      const [updated] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Article updated successfully",
        data: parseBlog(updated),
      });
    } catch (error: any) {
      console.error("Error updating article:", error);
      return c.json({ success: false, message: error.message || "Failed to update article" }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Article not found" }, 404);
      }

      await db.delete(blogs).where(eq(blogs.id, id));
      return c.json({ success: true, message: "Article deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting article:", error);
      return c.json({ success: false, message: error.message || "Failed to delete article" }, 500);
    }
  }
}
