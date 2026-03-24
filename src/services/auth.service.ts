import { authRepository } from "../repositories/auth.repository";
import { hashPassword, verifyPassword } from "../utils/libs/hash";
import { signToken } from "../utils/libs/jwt";
import { AppError } from "../middlewares/errorHandler";
import type { LoginDTO } from "../validators/auth.validator";

export const authService = {
    async register(data: LoginDTO) {
        const existing = await authRepository.findByUsername(data.username);
        if (existing) throw new AppError(409, "Username already taken");

        const hashed = await hashPassword(data.password);
        const user = await authRepository.create(data.username, hashed);

        const token = await signToken(user.id, user.username);

        return {
            token,
            user: { id: user.id, username: user.username },
        };
    },

    async login(data: LoginDTO) {
        const user = await authRepository.findByUsername(data.username);
        if (!user) throw new AppError(401, "Invalid username or password");

        const valid = await verifyPassword(data.password, user.password);
        if (!valid) throw new AppError(401, "Invalid username or password");

        const token = await signToken(user.id, user.username);

        return {
            token,
            user: { id: user.id, username: user.username },
        };
    },
};