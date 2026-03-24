import { menuItemRepository } from "../repositories/menuItem.repository";
import { restaurantRepository } from "../repositories/restaurant.repository";
import { AppError } from "../middlewares/errorHandler";
import type { CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemFilterDTO } from "../validators/menuItem.validator";

export const menuItemService = {
    async getByRestaurant(restaurantId: string, filter: MenuItemFilterDTO) {
        const restaurant = await restaurantRepository.findById(restaurantId);
        if (!restaurant) throw new AppError(404, `Restaurant with id ${restaurantId} not found`);

        const [items, total] = await Promise.all([
            menuItemRepository.findByRestaurant(restaurantId, filter),
            menuItemRepository.countByRestaurant(restaurantId, filter),
        ]);

        return {
            data: items,
            meta: {
                total,
                page: filter.page,
                limit: filter.limit,
                totalPages: Math.ceil(total / filter.limit),
            },
        };
    },

    async create(restaurantId: string, data: CreateMenuItemDTO) {
        const restaurant = await restaurantRepository.findById(restaurantId);
        if (!restaurant) throw new AppError(404, `Restaurant with id ${restaurantId} not found`);
        return menuItemRepository.create(restaurantId, data);
    },

    async update(id: string, data: UpdateMenuItemDTO) {
        const item = await menuItemRepository.findById(id);
        if (!item) throw new AppError(404, `Menu item with id ${id} not found`);
        return menuItemRepository.update(id, data);
    },

    async delete(id: string) {
        const item = await menuItemRepository.findById(id);
        if (!item) throw new AppError(404, `Menu item with id ${id} not found`);
        return menuItemRepository.delete(id);
    },
};