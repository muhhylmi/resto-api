import { z } from "zod";

const CategoryEnum = z.enum(["APPETIZER", "MAIN", "DESSERT", "DRINK"]);

export const createMenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    category: CategoryEnum.default("MAIN"),
    is_available: z.boolean().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const menuItemFilterSchema = z.object({
    category: CategoryEnum.optional(),
    name: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateMenuItemDTO = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemDTO = z.infer<typeof updateMenuItemSchema>;
export type MenuItemFilterDTO = z.infer<typeof menuItemFilterSchema>;