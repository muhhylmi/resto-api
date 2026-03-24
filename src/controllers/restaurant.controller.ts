import type { Context } from "hono";
import { restaurantService } from "../services/restaurant.service";
import { createRestaurantSchema, restaurantFilterSchema, updateRestaurantSchema } from "../validators/restaurant.validator";
import { sendCreated, sendDeleted, sendError, sendPagination, sendSuccess } from "../utils/responses";

export const restaurantController = {
    async getAll(c: Context) {
        const query = restaurantFilterSchema.safeParse(c.req.query());

        if (!query.success) {
            return sendError(c, 400, "Validation failed", query.error.flatten().fieldErrors);
        }

        const { data, meta } = await restaurantService.getAll(query.data);
        return sendPagination(c, data, meta, "Restaurants retrieved successfully");
    },

    async getById(c: Context) {
        const id = String(c.req.param("id"));
        const data = await restaurantService.getById(id);
        return sendSuccess(c, data, "succes retrieve restaurant data");
    },

    async create(c: Context) {
        const body = await c.req.json();
        const parsed = createRestaurantSchema.safeParse(body);
        if (!parsed.success) return c.json({ errors: parsed.error.flatten().fieldErrors }, 400);

        const data = await restaurantService.create(parsed.data);
        return sendCreated(c, data, "success create data");
    },

    async update(c: Context) {
        const id = String(c.req.param("id"));
        const body = await c.req.json();
        const parsed = updateRestaurantSchema.safeParse(body);

        if (!parsed.success) {
            return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
        }

        const data = await restaurantService.update(id, parsed.data);
        return sendSuccess(c, data, "Restaurant updated successfully");
    },

    async delete(c: Context) {
        const id = String(c.req.param("id"));
        await restaurantService.delete(id);
        return sendDeleted(c, "Restaurant deleted succesfully");
    },



};