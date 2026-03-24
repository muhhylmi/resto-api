import { z } from "zod";

export const createRestaurantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().optional(),
    opening_hours: z.string().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantFilterSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateRestaurantDTO = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantDTO = z.infer<typeof updateRestaurantSchema>;
export type RestaurantFilterDTO = z.infer<typeof restaurantFilterSchema>;
