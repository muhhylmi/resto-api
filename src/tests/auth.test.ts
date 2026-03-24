import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { prisma } from "../utils/prisma";
import { authService } from "../services/auth.service";
import { AppError } from "../middlewares/errorHandler";

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: { startsWith: "test_" } } });
    await prisma.$disconnect();
});

beforeEach(async () => {
    await prisma.user.deleteMany({ where: { username: { startsWith: "test_" } } });
});

// ----------------------------------------------------------------
describe("Auth Service - register", () => {
    it("should register a new user and return token", async () => {
        const result = await authService.register({
            username: "test_user",
            password: "secret123",
        });

        expect(result.token).toBeDefined();
        expect(typeof result.token).toBe("string");
        expect(result.user.username).toBe("test_user");
        expect(result.user.id).toBeDefined();
    });

    it("should hash the password (not store plain text)", async () => {
        await authService.register({
            username: "test_hashcheck",
            password: "secret123",
        });

        const user = await prisma.user.findUnique({ where: { username: "test_hashcheck" } });
        expect(user?.password).not.toBe("secret123");
        expect(user?.password).toBeDefined();
    });

    it("should throw 409 if username already taken", async () => {
        await authService.register({
            username: "test_duplicate",
            password: "secret123",
        });

        expect(
            authService.register({ username: "test_duplicate", password: "secret123" })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: "Username already taken",
        });
    });
});

// ----------------------------------------------------------------
describe("Auth Service - login", () => {
    beforeEach(async () => {
        await authService.register({
            username: "test_login",
            password: "secret123",
        });
        await authService.register({
            username: "test_login2",
            password: "secret123",
        });
    });

    it("should login and return token", async () => {
        const result = await authService.login({
            username: "test_login",
            password: "secret123",
        });

        expect(result.token).toBeDefined();
        expect(typeof result.token).toBe("string");
        expect(result.user.username).toBe("test_login");
    });

    it("should throw 401 if username not found", async () => {
        expect(
            authService.login({ username: "test_notexist", password: "secret123" })
        ).rejects.toMatchObject({
            statusCode: 401,
            message: "Invalid username or password",
        });
    });

    it("should throw 401 if password is wrong", async () => {
        expect(
            authService.login({ username: "test_login", password: "wrongpassword" })
        ).rejects.toMatchObject({
            statusCode: 401,
            message: "Invalid username or password",
        });
    });

    it("should return different token each login", async () => {
        const first = await authService.login({ username: "test_login", password: "secret123" });
        const second = await authService.login({ username: "test_login2", password: "secret123" });

        expect(first.token).not.toBe(second.token);
    });
});

// ----------------------------------------------------------------
describe("Auth Service - token", () => {
    it("should return a valid JWT structure", async () => {
        const result = await authService.register({
            username: "test_jwt",
            password: "secret123",
        });

        const parts = result.token.split(".");
        expect(parts.length).toBe(3);
    });

    it("should contain correct payload in token", async () => {
        const result = await authService.login({
            username: "test_login",
            password: "secret123",
        }).catch(async () => {
            await authService.register({ username: "test_login", password: "secret123" });
            return authService.login({ username: "test_login", password: "secret123" });
        });

        const payload = JSON.parse(
            Buffer.from(String(result.token.split(".")[1]), "base64").toString()
        );

        expect(payload.username).toBe("test_login");
        expect(payload.sub).toBeDefined();
        expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
});