import type { Context } from "hono";

export const sendSuccess = (c: Context, data: unknown, message = "Success") => {
    return c.json({
        success: true,
        message,
        data,
    });
};

export const sendCreated = (c: Context, data: unknown, message = "Created successfully") => {
    return c.json(
        {
            success: true,
            message,
            data,
        },
        201
    );
};

export const sendError = (c: Context, statusCode: number, message: string, errors?: unknown) => {
    return c.json(
        {
            success: false,
            message,
            errors,
        },
        statusCode as any
    );
};

export const sendPagination = (c: Context, data: unknown, meta: unknown, message = "Success") => {
    return c.json({
        success: true,
        message,
        data,
        meta,
    });
};

export const sendDeleted = (c: Context, message = "Success") => {
    return c.json(
        {
            success: true,
            message,
        },
        204 as any);
};