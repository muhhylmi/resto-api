import type { Context } from "hono";
import { authService } from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { sendSuccess, sendCreated, sendError } from "../utils/responses";

export const authController = {
    async register(c: Context) {
        const body = await c.req.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
        }

        const data = await authService.register(parsed.data);
        return sendCreated(c, data, "User registered successfully");
    },

    async login(c: Context) {
        const body = await c.req.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
        }

        const data = await authService.login(parsed.data);
        return sendSuccess(c, data, "Login successful");
    },
};