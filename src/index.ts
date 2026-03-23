import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { AppError } from "./middlewares/errorHandler";
import restaurantRoutes from "./routes/restaurant.route";
import menuItemRoutes from "./routes/menuItem.route";
import { PrismaInstance } from "./utils/prisma";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => c.json({ message: "Restaurant API v1" }));
app.route("/restaurants", restaurantRoutes);
app.route("/menu-items", menuItemRoutes);


PrismaInstance.getInstance()

app.onError((err, c) => {
    if (err instanceof AppError) {
        return c.json({ success: false, message: err.message }, err.statusCode as any);
    }
    console.error(err);
    return c.json({ success: false, message: "Internal server error" }, 500);
});

export default {
    port: process.env.PORT ?? 3000,
    fetch: app.fetch,
    idleTimeout: 60, // detik
};