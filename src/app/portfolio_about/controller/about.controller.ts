import { Context } from "hono";
import { db } from "../../../db/connection";
import { experiences, educations, skill_categories } from "../../../db/schema";
import { eq, desc, asc } from "drizzle-orm";

function parseExperience(item: any) {
  if (!item) return null;
  return {
    ...item,
    skills: item.skills ? (typeof item.skills === "string" ? JSON.parse(item.skills) : item.skills) : [],
  };
}

function parseSkillCategory(item: any) {
  if (!item) return null;
  return {
    ...item,
    skills: item.skills ? (typeof item.skills === "string" ? JSON.parse(item.skills) : item.skills) : [],
  };
}

export class AboutController {
  /* ─────────────────────────────────────────────────────────────
   * EXPERIENCES
   * ───────────────────────────────────────────────────────────── */
  static async getExperiences(c: Context) {
    try {
      const rows = await db
        .select()
        .from(experiences)
        .orderBy(desc(experiences.sort_order), desc(experiences.id));

      return c.json({
        success: true,
        data: rows.map(parseExperience),
      });
    } catch (error: any) {
      console.error("Error fetching experiences:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch experiences" }, 500);
    }
  }

  static async createExperience(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.role || !body.company || !body.period) {
        return c.json({ success: false, message: "Role, company, and period are required" }, 400);
      }

      const skillsStr = body.skills ? JSON.stringify(body.skills) : JSON.stringify([]);

      const insertValues = {
        role: body.role,
        company: body.company,
        period: body.period,
        location: body.location || "",
        company_url: body.company_url || null,
        description: body.description || "",
        skills: skillsStr,
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(experiences).values(insertValues);
      const [created] = await db.select().from(experiences).where(eq(experiences.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Experience created successfully",
        data: parseExperience(created),
      }, 201);
    } catch (error: any) {
      console.error("Error creating experience:", error);
      return c.json({ success: false, message: error.message || "Failed to create experience" }, 500);
    }
  }

  static async updateExperience(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Experience not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.role !== undefined) updateValues.role = body.role;
      if (body.company !== undefined) updateValues.company = body.company;
      if (body.period !== undefined) updateValues.period = body.period;
      if (body.location !== undefined) updateValues.location = body.location;
      if (body.company_url !== undefined) updateValues.company_url = body.company_url;
      if (body.description !== undefined) updateValues.description = body.description;
      if (body.skills !== undefined) updateValues.skills = JSON.stringify(body.skills);
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      await db.update(experiences).set(updateValues).where(eq(experiences.id, id));
      const [updated] = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Experience updated successfully",
        data: parseExperience(updated),
      });
    } catch (error: any) {
      console.error("Error updating experience:", error);
      return c.json({ success: false, message: error.message || "Failed to update experience" }, 500);
    }
  }

  static async deleteExperience(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Experience not found" }, 404);
      }

      await db.delete(experiences).where(eq(experiences.id, id));
      return c.json({ success: true, message: "Experience deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting experience:", error);
      return c.json({ success: false, message: error.message || "Failed to delete experience" }, 500);
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * EDUCATIONS
   * ───────────────────────────────────────────────────────────── */
  static async getEducations(c: Context) {
    try {
      const rows = await db
        .select()
        .from(educations)
        .orderBy(desc(educations.sort_order), desc(educations.id));

      return c.json({
        success: true,
        data: rows,
      });
    } catch (error: any) {
      console.error("Error fetching educations:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch educations" }, 500);
    }
  }

  static async createEducation(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.degree || !body.institution || !body.period) {
        return c.json({ success: false, message: "Degree, institution, and period are required" }, 400);
      }

      const insertValues = {
        degree: body.degree,
        institution: body.institution,
        period: body.period,
        description: body.description || "",
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(educations).values(insertValues);
      const [created] = await db.select().from(educations).where(eq(educations.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Education created successfully",
        data: created,
      }, 201);
    } catch (error: any) {
      console.error("Error creating education:", error);
      return c.json({ success: false, message: error.message || "Failed to create education" }, 500);
    }
  }

  static async updateEducation(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(educations).where(eq(educations.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Education not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.degree !== undefined) updateValues.degree = body.degree;
      if (body.institution !== undefined) updateValues.institution = body.institution;
      if (body.period !== undefined) updateValues.period = body.period;
      if (body.description !== undefined) updateValues.description = body.description;
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      await db.update(educations).set(updateValues).where(eq(educations.id, id));
      const [updated] = await db.select().from(educations).where(eq(educations.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Education updated successfully",
        data: updated,
      });
    } catch (error: any) {
      console.error("Error updating education:", error);
      return c.json({ success: false, message: error.message || "Failed to update education" }, 500);
    }
  }

  static async deleteEducation(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(educations).where(eq(educations.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Education not found" }, 404);
      }

      await db.delete(educations).where(eq(educations.id, id));
      return c.json({ success: true, message: "Education deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting education:", error);
      return c.json({ success: false, message: error.message || "Failed to delete education" }, 500);
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * SKILL CATEGORIES
   * ───────────────────────────────────────────────────────────── */
  static async getSkills(c: Context) {
    try {
      const rows = await db
        .select()
        .from(skill_categories)
        .orderBy(asc(skill_categories.sort_order), asc(skill_categories.id));

      return c.json({
        success: true,
        data: rows.map(parseSkillCategory),
      });
    } catch (error: any) {
      console.error("Error fetching skills:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch skills" }, 500);
    }
  }

  static async createSkillCategory(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.category) {
        return c.json({ success: false, message: "Category name is required" }, 400);
      }

      const skillsStr = body.skills ? JSON.stringify(body.skills) : JSON.stringify([]);

      const insertValues = {
        category: body.category,
        skills: skillsStr,
        sort_order: Number(body.sort_order || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [res] = await db.insert(skill_categories).values(insertValues);
      const [created] = await db.select().from(skill_categories).where(eq(skill_categories.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Skill category created successfully",
        data: parseSkillCategory(created),
      }, 201);
    } catch (error: any) {
      console.error("Error creating skill category:", error);
      return c.json({ success: false, message: error.message || "Failed to create skill category" }, 500);
    }
  }

  static async updateSkillCategory(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const body = await c.req.json();

      const [existing] = await db.select().from(skill_categories).where(eq(skill_categories.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Skill category not found" }, 404);
      }

      const updateValues: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.category !== undefined) updateValues.category = body.category;
      if (body.skills !== undefined) updateValues.skills = JSON.stringify(body.skills);
      if (body.sort_order !== undefined) updateValues.sort_order = Number(body.sort_order);

      await db.update(skill_categories).set(updateValues).where(eq(skill_categories.id, id));
      const [updated] = await db.select().from(skill_categories).where(eq(skill_categories.id, id)).limit(1);

      return c.json({
        success: true,
        message: "Skill category updated successfully",
        data: parseSkillCategory(updated),
      });
    } catch (error: any) {
      console.error("Error updating skill category:", error);
      return c.json({ success: false, message: error.message || "Failed to update skill category" }, 500);
    }
  }

  static async deleteSkillCategory(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(skill_categories).where(eq(skill_categories.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Skill category not found" }, 404);
      }

      await db.delete(skill_categories).where(eq(skill_categories.id, id));
      return c.json({ success: true, message: "Skill category deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting skill category:", error);
      return c.json({ success: false, message: error.message || "Failed to delete skill category" }, 500);
    }
  }
}
