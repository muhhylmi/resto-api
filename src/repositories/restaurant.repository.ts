import { prisma } from "../utils/prisma";
import type { CreateRestaurantDTO, UpdateRestaurantDTO } from "../validators/restaurant.validator";

export const restaurantRepository = {
    findAll() {
        return prisma.restaurant.findMany({
            orderBy: { createdAt: "desc" },
        });
    },

    findById(id: number) {
        return prisma.restaurant.findUnique({
            where: { id },
            include: { menuItems: true },
        });
    },

    create(data: CreateRestaurantDTO) {
        return prisma.restaurant.create({ data });
    },

    update(id: number, data: UpdateRestaurantDTO) {
        return prisma.restaurant.update({ where: { id }, data });
    },

    delete(id: number) {
        return prisma.restaurant.delete({ where: { id } });
    },
};