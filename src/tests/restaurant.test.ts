import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { prisma } from "../utils/prisma";
import { restaurantService } from "../services/restaurant.service";
import { ulid } from "ulid";

const mockRestaurant = {
    id: ulid(),
    name: "Test Warung",
    address: "Jl. Test No. 1, Jakarta",
    phone: "021-1234567",
    opening_hours: "08:00 - 22:00",
};

const mockRestaurant2 = {
    id: ulid(),
    name: "Test Kafe",
    address: "Jl. Test No. 2, Bandung",
    phone: "022-7654321",
    opening_hours: "10:00 - 23:00",
};

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.restaurant.deleteMany({ where: { name: { startsWith: "Test" } } });
    await prisma.$disconnect();
});

beforeEach(async () => {
    await prisma.restaurant.deleteMany({ where: { name: { startsWith: "Test" } } });
});

// ----------------------------------------------------------------
describe("Restaurant Service - getAll", () => {
    it("should return paginated data with meta", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const result = await restaurantService.getAll({ page: 1, limit: 10 });

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.meta).toBeDefined();
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
        expect(result.meta.total).toBeGreaterThanOrEqual(2);
        expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it("should return correct total pages", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const result = await restaurantService.getAll({ page: 1, limit: 1 });

        expect(result.data.length).toBe(1);
        expect(result.meta.totalPages).toBeGreaterThanOrEqual(2);
    });

    it("should search by name", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const result = await restaurantService.getAll({ search: "Warung", page: 1, limit: 10 });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((r) => r.name.includes("Warung"))).toBe(true);
    });

    it("should search by address", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const result = await restaurantService.getAll({ search: "Bandung", page: 1, limit: 10 });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((r) => r.address.includes("Bandung"))).toBe(true);
    });

    it("should search by phone", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const result = await restaurantService.getAll({ search: "022", page: 1, limit: 10 });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((r) => r.phone?.includes("022"))).toBe(true);
    });

    it("should return empty data if search not found", async () => {
        const result = await restaurantService.getAll({ search: "tidakada123", page: 1, limit: 10 });

        expect(result.data.length).toBe(0);
        expect(result.meta.total).toBe(0);
    });

    it("should paginate correctly", async () => {
        await prisma.restaurant.createMany({ data: [mockRestaurant, mockRestaurant2] });

        const page1 = await restaurantService.getAll({ page: 1, limit: 1 });
        const page2 = await restaurantService.getAll({ page: 2, limit: 1 });

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBe(1);
        expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id);
    });
});

// ----------------------------------------------------------------
describe("Restaurant Service - getById", () => {
    it("should return restaurant with menu items", async () => {
        const created = await prisma.restaurant.create({
            data: {
                ...mockRestaurant,
                menuItems: {
                    create: [
                        { id: ulid(), name: "Test Nasi Goreng", price: 35000, category: "MAIN" },
                    ],
                },
            },
        });

        const result = await restaurantService.getById(created.id);

        expect(result.id).toBe(created.id);
        expect(result.name).toBe(mockRestaurant.name);
        expect(result.menuItems).toBeDefined();
        expect(Array.isArray(result.menuItems)).toBe(true);
        expect(result.menuItems.length).toBe(1);
    });

    it("should throw 404 if restaurant not found", async () => {
        expect(
            restaurantService.getById("999999")
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Restaurant with id 999999 not found",
        });
    });
});

// ----------------------------------------------------------------
describe("Restaurant Service - create", () => {
    it("should create a restaurant with all fields", async () => {
        const result = await restaurantService.create(mockRestaurant);

        expect(result.id).toBeDefined();
        expect(result.name).toBe(mockRestaurant.name);
        expect(result.address).toBe(mockRestaurant.address);
        expect(result.phone).toBe(mockRestaurant.phone);
        expect(result.opening_hours).toBe(mockRestaurant.opening_hours);
        expect(result.createdAt).toBeDefined();
    });

    it("should create a restaurant with only required fields", async () => {
        const result = await restaurantService.create({
            name: "Test Minimal",
            address: "Jl. Minimal No. 1",
        });

        expect(result.id).toBeDefined();
        expect(result.name).toBe("Test Minimal");
        expect(result.phone).toBeNull();
        expect(result.opening_hours).toBeNull();
    });

    it("should persist to database", async () => {
        const result = await restaurantService.create(mockRestaurant);

        const inDb = await prisma.restaurant.findUnique({ where: { id: result.id } });
        expect(inDb).not.toBeNull();
        expect(inDb?.name).toBe(mockRestaurant.name);
    });
});

// ----------------------------------------------------------------
describe("Restaurant Service - update", () => {
    it("should update restaurant fields", async () => {
        const created = await restaurantService.create(mockRestaurant);

        const result = await restaurantService.update(created.id, {
            name: "Test Updated",
            phone: "021-9999999",
        });

        expect(result.name).toBe("Test Updated");
        expect(result.phone).toBe("021-9999999");
        expect(result.address).toBe(mockRestaurant.address);
    });

    it("should do partial update without affecting other fields", async () => {
        const created = await restaurantService.create(mockRestaurant);

        const result = await restaurantService.update(created.id, {
            name: "Test Partial Update",
        });

        expect(result.name).toBe("Test Partial Update");
        expect(result.address).toBe(mockRestaurant.address);
        expect(result.phone).toBe(mockRestaurant.phone);
        expect(result.opening_hours).toBe(mockRestaurant.opening_hours);
    });

    it("should throw 404 if restaurant not found", async () => {
        expect(
            restaurantService.update("999999", { name: "Test Not Found" })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Restaurant with id 999999 not found",
        });
    });
});

// ----------------------------------------------------------------
describe("Restaurant Service - delete", () => {
    it("should delete a restaurant", async () => {
        const created = await restaurantService.create(mockRestaurant);

        await restaurantService.delete(created.id);

        const inDb = await prisma.restaurant.findUnique({ where: { id: created.id } });
        expect(inDb).toBeNull();
    });

    it("should cascade delete menu items", async () => {
        const created = await prisma.restaurant.create({
            data: {
                ...mockRestaurant,
                menuItems: {
                    create: [
                        { id: ulid(), name: "Test Item", price: 20000, category: "MAIN" },
                    ],
                },
            },
            include: { menuItems: true },
        });

        await restaurantService.delete(created.id);

        const menuItems = await prisma.menuItem.findMany({
            where: { restaurantId: created.id },
        });
        expect(menuItems.length).toBe(0);
    });

    it("should throw 404 if restaurant not found", async () => {
        expect(
            restaurantService.delete("999999")
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Restaurant with id 999999 not found",
        });
    });
});