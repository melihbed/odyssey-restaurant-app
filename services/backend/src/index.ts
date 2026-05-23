import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import type { Env } from "./db";
import { menuRouter } from "./routes/menu";
import { customersRouter } from "./routes/customers";
import { ordersRouter } from "./routes/orders";
import { settingsRouter } from "./routes/settings";
import { homeRouter } from "./routes/home";

// Creates the Hono app
const app = new OpenAPIHono<{ Bindings: Env }>();

// Add middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:8082",
      "http://localhost:8081",
      "http://localhost:3000",
      "http://localhost:19006",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Mount all route files
app.route("/menu", menuRouter);
app.route("/customers", customersRouter);
app.route("/orders", ordersRouter);
app.route("/settings", settingsRouter);
app.route("/home", homeRouter);

// Publish auto-generated OpenAPI JSON
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Odyssey Restaurant API", version: "1.0.0" },
  servers: [{ url: "http://localhost:8787", description: "Local dev" }],
});

app.get(
  "/ui",
  apiReference({
    spec: { url: "/openapi.json" },
    theme: "default",
  })
);

app.get("/", (c) => c.json({ status: "ok", version: "1.0.0" }));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }
  console.error(err);
  return c.json({ message: "Internal server error" }, 500);
});

export default app;
