import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db, workItems } from "@workspace/db";
import { createWorkItemSchema, updateWorkItemSchema } from "@workspace/types";

const app = new Hono();

app.get("/", async (c) => {
  const items = await db.query.workItems.findMany({
    orderBy: (items, { desc }) => [desc(items.createdAt)],
  });
  return c.json(items);
});

app.post("/", zValidator("json", createWorkItemSchema), async (c) => {
  const data = c.req.valid("json");
  const [item] = await db
    .insert(workItems)
    .values({
      ...data,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
    })
    .returning();
  return c.json(item, 201);
});

app.patch("/:id", zValidator("json", updateWorkItemSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const updateData: Partial<typeof workItems.$inferInsert> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
  if (data.endAt !== undefined) updateData.endAt = new Date(data.endAt);

  const [item] = await db
    .update(workItems)
    .set(updateData)
    .where(eq(workItems.id, id))
    .returning();

  if (!item) {
    return c.json({ error: "Work item not found" }, 404);
  }

  return c.json(item);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [item] = await db
    .delete(workItems)
    .where(eq(workItems.id, id))
    .returning();

  if (!item) {
    return c.json({ error: "Work item not found" }, 404);
  }

  return c.json({ success: true });
});

export { app as workItemsRouter };
