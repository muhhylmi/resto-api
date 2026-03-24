import type { Context } from "hono";
import { menuItemService } from "../services/menuItem.service";
import { createMenuItemSchema, updateMenuItemSchema, menuItemFilterSchema } from "../validators/menuItem.validator";
import { sendCreated, sendDeleted, sendError, sendSuccess } from "../utils/responses";

export const menuItemController = {
    async getByRestaurant(c: Context) {
        const restaurantId = String(c.req.param("id"));
        const query = menuItemFilterSchema.safeParse(c.req.query());

        if (!query.success) {
            return sendError(c, 400, "Validation failed", query.error.flatten().fieldErrors);
        }

        const data = await menuItemService.getByRestaurant(restaurantId, query.data);
        return sendSuccess(c, data, "Success retrieve menu items");
    },

    async create(c: Context) {
        const restaurantId = String(c.req.param("id"));
        const body = await c.req.json();
        const parsed = createMenuItemSchema.safeParse(body);

        if (!parsed.success) {
            return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
        }

        const data = await menuItemService.create(restaurantId, parsed.data);
        return sendCreated(c, data, "Menu Item created sucessfully");
    },

    async update(c: Context) {
        const id = String(c.req.param("id"));
        const body = await c.req.json();
        const parsed = updateMenuItemSchema.safeParse(body);

        if (!parsed.success) {
            return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
        }

        const data = await menuItemService.update(id, parsed.data);
        return sendSuccess(c, data, "Menu item updated successfully");
    },

    async delete(c: Context) {
        const id = String(c.req.param("id"));
        await menuItemService.delete(id);
        return sendDeleted(c, "Menu item deleted succesfully");
    },
};