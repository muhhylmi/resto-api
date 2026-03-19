import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorHandler";


const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", errorHandler);

app.get("/", (c) => c.json({ message: "Restaurant API v1" }));

export default { port: process.env.PORT ?? 3000, fetch: app.fetch };