import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { AppEnv } from "./types";
import { databaseMiddleware } from "./middleware/database";
import { errorHandler } from "./middleware/error-handler";
import { operaciones } from "./operaciones";
const app = new Hono<AppEnv>();
app.use("*", logger());
app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);
app.onError(errorHandler);
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);
app.use("/api/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});
app.use("/api/*", databaseMiddleware);
app.route("/api", operaciones);
export type ApiRoutes = typeof app;
export default app;
