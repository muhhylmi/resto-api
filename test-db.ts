import { prisma } from "./src/utils/prisma";

// test-db.ts
async function main() {
    await prisma.$connect();
    console.log("Connected!");
    await prisma.$disconnect();
}

main().catch(console.error);