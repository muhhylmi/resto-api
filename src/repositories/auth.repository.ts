import { ulid } from "ulid";
import { prisma } from "../utils/prisma";

export const authRepository = {
    findByUsername(username: string) {
        return prisma.user.findUnique({ where: { username } });
    },

    create(username: string, hashedPassword: string) {
        return prisma.user.create({
            data: { id: ulid(), username, password: hashedPassword },
        });
    },
};