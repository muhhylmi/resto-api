import { ulid } from "ulid";
import { prisma } from "../utils/prisma";
import type { CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemFilterDTO } from "../validators/menuItem.validator";

export const menuItemRepository = {
    findByRestaurant(restaurantId: string, filter: MenuItemFilterDTO) {
        const { category, name, page, limit } = filter;
        const skip = (page - 1) * limit;

        return prisma.menuItem.findMany({
            where: {
                restaurantId,
                ...(category && { category }),
                ...(name && { name: { contains: name } }),
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    },

    countByRestaurant(restaurantId: string, filter: Pick<MenuItemFilterDTO, "category" | "name">) {
        return prisma.menuItem.count({
            where: {
                restaurantId,
                ...(filter.category && { category: filter.category }),
                ...(filter.name && { name: { contains: filter.name } }),
            },
        });
    },

    findById(id: string) {
        return prisma.menuItem.findUnique({ where: { id } });
    },

    create(restaurantId: string, data: CreateMenuItemDTO) {
        return prisma.menuItem.create({
            data: { ...data, price: data.price.toString(), restaurantId, id: ulid() },
        });
    },

    update(id: string, data: UpdateMenuItemDTO) {
        return prisma.menuItem.update({
            where: { id },
            data: { ...data, ...(data.price && { price: data.price.toString() }) },
        });
    },

    delete(id: string) {
        return prisma.menuItem.delete({ where: { id } });
    },
};