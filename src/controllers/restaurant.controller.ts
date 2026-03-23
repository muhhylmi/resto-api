import type { Context } from "hono";
import { restaurantService } from "../services/restaurant.service";
import { createRestaurantSchema, updateRestaurantSchema } from "../validators/restaurant.validator";
import { sendCreated, sendSuccess } from "../utils/responses";

export const restaurantController = {
    async getAll(c: Context) {
        const data = await restaurantService.getAll();
        return sendSuccess(c, data, "succes retrieve restaurant data");
    },

    async getById(c: Context) {
        const id = Number(c.req.param("id"));
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
        // TODO: parse id, validate body with updateRestaurantSchema, call service
    },

    async delete(c: Context) {
        // TODO: parse id, call service, return 204
    },
};