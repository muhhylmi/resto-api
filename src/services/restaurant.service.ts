import { restaurantRepository } from "../repositories/restaurant.repository";
import { AppError } from "../middlewares/errorHandler";
import type { CreateRestaurantDTO, RestaurantFilterDTO, UpdateRestaurantDTO } from "../validators/restaurant.validator";

export const restaurantService = {
    async getAll(filter: RestaurantFilterDTO) {
        const [data, total] = await Promise.all([
            restaurantRepository.findAll(filter),
            restaurantRepository.count(filter),
        ]);

        return {
            data,
            meta: {
                total,
                page: filter.page,
                limit: filter.limit,
                totalPages: Math.ceil(total / filter.limit),
            },
        };
    },

    async getById(id: string) {
        const restaurant = await restaurantRepository.findById(id);
        if (!restaurant) throw new AppError(404, `Restaurant with id ${id} not found`);
        return restaurant;
    },

    async create(data: CreateRestaurantDTO) {
        return restaurantRepository.create(data);
    },

    async update(id: string, data: UpdateRestaurantDTO) {
        await this.getById(id); // throws 404 if not found
        return restaurantRepository.update(id, data);
    },

    async delete(id: string) {
        await this.getById(id);
        return restaurantRepository.delete(id);
    },
};