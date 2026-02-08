import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { workItemsRouter } from "./routes/work-items.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/work-items", workItemsRouter);
app.route("/dashboard", dashboardRouter);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
