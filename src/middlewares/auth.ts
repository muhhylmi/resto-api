import type { Context, Next } from "hono";
import { verifyToken } from "../utils/libs/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
        return c.json({ success: false, message: "Authorization header is missing" }, 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
        return c.json({ success: false, message: "Invalid authorization format. Use Bearer <token>" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = await verifyToken(String(token));
        c.set("jwtPayload", payload);
        await next();
    } catch {
        return c.json({ success: false, message: "Invalid or expired token" }, 401);
    }
};