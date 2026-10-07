import { Context } from "hono";
import { db } from "../../../db/connection";
import { contact_messages } from "../../../db/schema";
import { eq, desc, asc } from "drizzle-orm";

export class ContactController {
  /**
   * POST /api/contact/send (Public)
   * Sends an inquiry message from the public website
   */
  static async send(c: Context) {
    try {
      const body = await c.req.json();
      if (!body.name || !body.email || !body.message) {
        return c.json({ success: false, message: "Name, email, and message are required" }, 400);
      }

      const insertValues = {
        name: body.name,
        email: body.email,
        subject: body.subject || "General Inquiry",
        message: body.message,
        is_read: false,
        created_at: new Date(),
      };

      const [res] = await db.insert(contact_messages).values(insertValues);
      const [created] = await db.select().from(contact_messages).where(eq(contact_messages.id, res.insertId)).limit(1);

      return c.json({
        success: true,
        message: "Your message has been sent successfully. Thank you!",
        data: created,
      }, 201);
    } catch (error: any) {
      console.error("Error sending message:", error);
      return c.json({ success: false, message: error.message || "Failed to send message" }, 500);
    }
  }

  /**
   * GET /api/contact/messages (Protected)
   * Get all messages for admin inbox
   */
  static async getAll(c: Context) {
    try {
      const rows = await db
        .select()
        .from(contact_messages)
        .orderBy(asc(contact_messages.is_read), desc(contact_messages.id));

      const unreadCount = rows.filter((r) => !r.is_read).length;

      return c.json({
        success: true,
        data: rows,
        unreadCount,
      });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      return c.json({ success: false, message: error.message || "Failed to fetch messages" }, 500);
    }
  }

  /**
   * PUT /api/contact/messages/:id/read (Protected)
   * Mark message as read
   */
  static async markAsRead(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(contact_messages).where(eq(contact_messages.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Message not found" }, 404);
      }

      await db.update(contact_messages).set({ is_read: true }).where(eq(contact_messages.id, id));

      return c.json({ success: true, message: "Message marked as read" });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to update message" }, 500);
    }
  }

  /**
   * DELETE /api/contact/messages/:id (Protected)
   * Delete message
   */
  static async delete(c: Context) {
    try {
      const id = Number(c.req.param("id"));
      const [existing] = await db.select().from(contact_messages).where(eq(contact_messages.id, id)).limit(1);
      if (!existing) {
        return c.json({ success: false, message: "Message not found" }, 404);
      }

      await db.delete(contact_messages).where(eq(contact_messages.id, id));
      return c.json({ success: true, message: "Message deleted successfully" });
    } catch (error: any) {
      return c.json({ success: false, message: error.message || "Failed to delete message" }, 500);
    }
  }
}
