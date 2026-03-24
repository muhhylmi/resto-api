import { ulid } from "ulid";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
})
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing seed data
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();

    // Restaurant 1
    const r1 = await prisma.restaurant.create({
        data: {
            id: ulid(),
            name: "Warung Nusantara",
            address: "Jl. Sudirman No. 10, Jakarta Pusat",
            phone: "021-1234567",
            opening_hours: "08:00 - 22:00",
            menuItems: {
                create: [
                    {
                        id: ulid(),
                        name: "Nasi Goreng Spesial",
                        description: "Nasi goreng dengan telur mata sapi, ayam suwir, dan kerupuk",
                        price: 35000,
                        category: "MAIN",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Soto Ayam",
                        description: "Soto kuah bening khas Jawa dengan soun dan telur rebus",
                        price: 30000,
                        category: "MAIN",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Lumpia Goreng",
                        description: "4 pcs lumpia isi sayuran dan ayam, disajikan dengan saus kacang",
                        price: 20000,
                        category: "APPETIZER",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Es Teh Manis",
                        description: "Teh manis dingin segar",
                        price: 8000,
                        category: "DRINK",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Klepon",
                        description: "6 pcs klepon isi gula merah, dibalut kelapa parut",
                        price: 15000,
                        category: "DESSERT",
                        is_available: true,
                    },
                ],
            },
        },
    });

    // Restaurant 2
    const r2 = await prisma.restaurant.create({
        data: {
            id: ulid(),
            name: "Kafe Santai",
            address: "Jl. Gatot Subroto No. 45, Bandung",
            phone: "022-9876543",
            opening_hours: "10:00 - 23:00",
            menuItems: {
                create: [
                    {
                        id: ulid(),
                        name: "Ayam Bakar Kecap",
                        description: "Ayam bakar bumbu kecap manis, disajikan dengan lalapan dan sambal",
                        price: 45000,
                        category: "MAIN",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Capcay Kuah",
                        description: "Tumis sayuran segar dengan kuah kaldu ayam",
                        price: 32000,
                        category: "MAIN",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Tahu Crispy",
                        description: "Tahu goreng crispy 6 pcs, disajikan dengan saus sambal pedas",
                        price: 18000,
                        category: "APPETIZER",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Jus Alpukat",
                        description: "Jus alpukat segar dengan susu kental manis",
                        price: 18000,
                        category: "DRINK",
                        is_available: true,
                    },
                    {
                        id: ulid(),
                        name: "Pisang Goreng Keju",
                        description: "3 pcs pisang goreng crispy dengan topping keju dan susu",
                        price: 15000,
                        category: "DESSERT",
                        is_available: true,
                    },
                ],
            },
        },
    });

    console.log(`✅ Seeded restaurant: ${r1.name}`);
    console.log(`✅ Seeded restaurant: ${r2.name}`);
    console.log("🎉 Seeding complete!");
}

main()
    .catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });