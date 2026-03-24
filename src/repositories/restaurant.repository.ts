import { ulid } from "ulid";
import { prisma } from "../utils/prisma";
import type { CreateRestaurantDTO, RestaurantFilterDTO, UpdateRestaurantDTO } from "../validators/restaurant.validator";

export const restaurantRepository = {
    findAll(filter: RestaurantFilterDTO) {
        const { search, page, limit } = filter;
        const skip = (page - 1) * limit;

        return prisma.restaurant.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: search } },
                        { address: { contains: search } },
                        { phone: { contains: search } },
                    ],
                }),
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    },

    count(filter: Pick<RestaurantFilterDTO, "search">) {
        return prisma.restaurant.count({
            where: {
                ...(filter.search && {
                    OR: [
                        { name: { contains: filter.search } },
                        { address: { contains: filter.search } },
                        { phone: { contains: filter.search } },
                    ],
                }),
            },
        });
    },

    findById(id: string) {
        return prisma.restaurant.findUnique({
            where: { id },
            include: { menuItems: true },
        });
    },

    create(data: CreateRestaurantDTO) {

        return prisma.restaurant.create({
            data: {
                id: ulid(),
                ...data
            }
        });
    },

    update(id: string, data: UpdateRestaurantDTO) {
        return prisma.restaurant.update({ where: { id }, data });
    },

    delete(id: string) {
        return prisma.restaurant.delete({ where: { id } });
    },
};