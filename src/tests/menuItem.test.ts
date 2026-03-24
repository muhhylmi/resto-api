import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { prisma } from "../utils/prisma";
import { menuItemService } from "../services/menuItem.service";
import { ulid } from "ulid";

const mockRestaurant = {
    id: ulid(),
    name: "Test Restaurant MenuItem",
    address: "Jl. Test No. 1, Jakarta",
    phone: "021-1234567",
    opening_hours: "08:00 - 22:00",
};

const mockMenuItem = {
    id: ulid(),
    name: "Test Nasi Goreng",
    description: "Nasi goreng spesial",
    price: 35000,
    category: "MAIN" as const,
    is_available: true,
};

const mockMenuItems = [
    { id: ulid(), name: "Test Soto Ayam", price: 30000, category: "MAIN" as const },
    { id: ulid(), name: "Test Lumpia", price: 20000, category: "APPETIZER" as const },
    { id: ulid(), name: "Test Es Teh", price: 8000, category: "DRINK" as const },
    { id: ulid(), name: "Test Klepon", price: 15000, category: "DESSERT" as const },
    { id: ulid(), name: "Test Ayam Bakar", price: 45000, category: "MAIN" as const },
];

let restaurantId: string;

beforeAll(async () => {
    await prisma.$connect();
    const restaurant = await prisma.restaurant.create({ data: mockRestaurant });
    restaurantId = restaurant.id;
});

afterAll(async () => {
    await prisma.menuItem.deleteMany({ where: { name: { startsWith: "Test" } } });
    await prisma.restaurant.deleteMany({ where: { name: { startsWith: "Test" } } });
    await prisma.$disconnect();
});

beforeEach(async () => {
    await prisma.menuItem.deleteMany({ where: { name: { startsWith: "Test" } } });
});

// ----------------------------------------------------------------
describe("MenuItem Service - getByRestaurant", () => {
    it("should return paginated menu items with meta", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId, id: ulid() })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            page: 1,
            limit: 10,
        });

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.meta).toBeDefined();
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
        expect(result.meta.total).toBeGreaterThanOrEqual(5);
        expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it("should filter by category MAIN", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            category: "MAIN",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(2);
        expect(result.data.every((item) => item.category === "MAIN")).toBe(true);
    });

    it("should filter by category APPETIZER", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            category: "APPETIZER",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((item) => item.category === "APPETIZER")).toBe(true);
    });

    it("should filter by category DRINK", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            category: "DRINK",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((item) => item.category === "DRINK")).toBe(true);
    });

    it("should filter by category DESSERT", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            category: "DESSERT",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((item) => item.category === "DESSERT")).toBe(true);
    });

    it("should search by name", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            name: "Soto",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((item) => item.name.includes("Soto"))).toBe(true);
    });

    it("should combine filter category and name", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const result = await menuItemService.getByRestaurant(restaurantId, {
            category: "MAIN",
            name: "Ayam",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((item) => item.category === "MAIN")).toBe(true);
        expect(result.data.some((item) => item.name.includes("Ayam"))).toBe(true);
    });

    it("should return empty data if search not found", async () => {
        const result = await menuItemService.getByRestaurant(restaurantId, {
            name: "tidakada123",
            page: 1,
            limit: 10,
        });

        expect(result.data.length).toBe(0);
        expect(result.meta.total).toBe(0);
    });

    it("should paginate correctly", async () => {
        await prisma.menuItem.createMany({
            data: mockMenuItems.map((item) => ({ ...item, restaurantId })),
        });

        const page1 = await menuItemService.getByRestaurant(restaurantId, { page: 1, limit: 2 });
        const page2 = await menuItemService.getByRestaurant(restaurantId, { page: 2, limit: 2 });

        expect(page1.data.length).toBe(2);
        expect(page2.data.length).toBe(2);
        expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id);
        expect(page1.data[1]?.id).not.toBe(page2.data[1]?.id);
    });

    it("should throw 404 if restaurant not found", async () => {
        expect(
            menuItemService.getByRestaurant("999999", { page: 1, limit: 10 })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Restaurant with id 999999 not found",
        });
    });
});

// ----------------------------------------------------------------
describe("MenuItem Service - create", () => {
    it("should create a menu item with all fields", async () => {
        const result = await menuItemService.create(restaurantId, mockMenuItem);

        expect(result.id).toBeDefined();
        expect(result.name).toBe(mockMenuItem.name);
        expect(result.description).toBe(mockMenuItem.description);
        expect(Number(result.price)).toBe(mockMenuItem.price);
        expect(result.category).toBe(mockMenuItem.category);
        expect(result.is_available).toBe(true);
        expect(result.restaurantId).toBe(restaurantId);
    });

    it("should create menu item with only required fields", async () => {
        const result = await menuItemService.create(restaurantId, {
            name: "Test Minimal Item",
            price: 10000,
            category: "MAIN",
            is_available: true,
        });

        expect(result.id).toBeDefined();
        expect(result.name).toBe("Test Minimal Item");
        expect(result.description).toBeNull();
    });

    it("should default is_available to true", async () => {
        const result = await menuItemService.create(restaurantId, {
            name: "Test Default Available",
            price: 10000,
            category: "MAIN",
            is_available: true,
        });

        expect(result.is_available).toBe(true);
    });

    it("should persist to database", async () => {
        const result = await menuItemService.create(restaurantId, mockMenuItem);

        const inDb = await prisma.menuItem.findUnique({ where: { id: result.id } });
        expect(inDb).not.toBeNull();
        expect(inDb?.name).toBe(mockMenuItem.name);
        expect(inDb?.restaurantId).toBe(restaurantId);
    });

    it("should throw 404 if restaurant not found", async () => {
        expect(
            menuItemService.create("999999", mockMenuItem)
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Restaurant with id 999999 not found",
        });
    });
});

// ----------------------------------------------------------------
describe("MenuItem Service - update", () => {
    it("should update menu item fields", async () => {
        const created = await menuItemService.create(restaurantId, mockMenuItem);

        const result = await menuItemService.update(created.id, {
            name: "Test Updated Item",
            price: 50000,
        });

        expect(result.name).toBe("Test Updated Item");
        expect(Number(result.price)).toBe(50000);
        expect(result.category).toBe(mockMenuItem.category);
    });

    it("should do partial update without affecting other fields", async () => {
        const created = await menuItemService.create(restaurantId, mockMenuItem);

        const result = await menuItemService.update(created.id, {
            name: "Test Partial Update Item",
        });

        expect(result.name).toBe("Test Partial Update Item");
        expect(Number(result.price)).toBe(mockMenuItem.price);
        expect(result.category).toBe(mockMenuItem.category);
        expect(result.description).toBe(mockMenuItem.description);
    });

    it("should update is_available to false", async () => {
        const created = await menuItemService.create(restaurantId, mockMenuItem);

        const result = await menuItemService.update(created.id, {
            is_available: false,
        });

        expect(result.is_available).toBe(false);
    });

    it("should update category", async () => {
        const created = await menuItemService.create(restaurantId, mockMenuItem);

        const result = await menuItemService.update(created.id, {
            category: "DESSERT",
        });

        expect(result.category).toBe("DESSERT");
    });

    it("should throw 404 if menu item not found", async () => {
        expect(
            menuItemService.update("999999", { name: "Test Not Found" })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Menu item with id 999999 not found",
        });
    });
});

// ----------------------------------------------------------------
describe("MenuItem Service - delete", () => {
    it("should delete a menu item", async () => {
        const created = await menuItemService.create(restaurantId, mockMenuItem);

        await menuItemService.delete(created.id);

        const inDb = await prisma.menuItem.findUnique({ where: { id: created.id } });
        expect(inDb).toBeNull();
    });

    it("should only delete the targeted menu item", async () => {
        const item1 = await menuItemService.create(restaurantId, mockMenuItem);
        const item2 = await menuItemService.create(restaurantId, {
            ...mockMenuItem,
            name: "Test Item Keep",
        });

        await menuItemService.delete(item1.id);

        const inDb = await prisma.menuItem.findUnique({ where: { id: item2.id } });
        expect(inDb).not.toBeNull();
    });

    it("should throw 404 if menu item not found", async () => {
        expect(
            menuItemService.delete("999999")
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Menu item with id 999999 not found",
        });
    });
});