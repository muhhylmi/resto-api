import { restaurantRepository } from "../repositories/restaurant.repository";
import { AppError } from "../middlewares/errorHandler";
import type { CreateRestaurantDTO, UpdateRestaurantDTO } from "../validators/restaurant.validator";

export const restaurantService = {
    async getAll() {
        return restaurantRepository.findAll();
    },

    async getById(id: number) {
        const restaurant = await restaurantRepository.findById(id);
        if (!restaurant) throw new AppError(404, `Restaurant with id ${id} not found`);
        return restaurant;
    },

    async create(data: CreateRestaurantDTO) {
        return restaurantRepository.create(data);
    },

    async update(id: number, data: UpdateRestaurantDTO) {
        await this.getById(id); // throws 404 if not found
        return restaurantRepository.update(id, data);
    },

    async delete(id: number) {
        await this.getById(id);
        return restaurantRepository.delete(id);
    },
};