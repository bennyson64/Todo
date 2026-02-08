import { Hono } from "hono";
import { db, workItems } from "@workspace/db";
import { sql } from "drizzle-orm";

const app = new Hono();

app.get("/metrics", async (c) => {
  const now = new Date();

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workItems);

  const [activeResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workItems)
    .where(sql`${workItems.status} IN ('todo', 'in_progress', 'review')`);

  const [completedResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workItems)
    .where(sql`${workItems.status} = 'done'`);

  const [overdueResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workItems)
    .where(
      sql`${workItems.endAt} < ${now.toISOString()} AND ${workItems.status} != 'done' AND ${workItems.status} != 'archive'`,
    );

  return c.json({
    totalTasks: totalResult?.count ?? 0,
    activeTasks: activeResult?.count ?? 0,
    completedTasks: completedResult?.count ?? 0,
    overdueTasks: overdueResult?.count ?? 0,
  });
});

app.get("/by-status", async (c) => {
  const results = await db
    .select({
      status: workItems.status,
      count: sql<number>`count(*)::int`,
    })
    .from(workItems)
    .groupBy(workItems.status);

  return c.json(results);
});

app.get("/over-time", async (c) => {
  const results = await db
    .select({
      date: sql<string>`DATE(${workItems.createdAt})::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(workItems)
    .groupBy(sql`DATE(${workItems.createdAt})`)
    .orderBy(sql`DATE(${workItems.createdAt})`);

  return c.json(results);
});

export { app as dashboardRouter };
