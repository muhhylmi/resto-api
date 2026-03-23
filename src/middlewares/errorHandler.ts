import type { Context, Next } from "hono";

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}

export const errorHandler = async (c: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        if (err instanceof AppError) {
            return c.json({ success: false, message: err.message }, err.statusCode as any);
        }
        console.error(err);
        return c.json({ success: false, message: "Internal server error" }, 500);
    }
};