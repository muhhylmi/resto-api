import * as Graceful from "../graceful";
import { PrismaClient } from "../../../generated/prisma/client";
import { ulidExtension } from "./extension";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export class PrismaInstance {
    private static instance: PrismaInstance;
    private prisma: PrismaClient;
    private constructor() {
        this.prisma = new PrismaClient({
            log: [
                {
                    emit: "stdout",
                    level: "query",
                },
                {
                    emit: "stdout",
                    level: "error",
                },
                {
                    emit: "stdout",
                    level: "info",
                },
                {
                    emit: "stdout",
                    level: "warn",
                },
            ],
            adapter: new PrismaMariaDb({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                port: Number(process.env.DATABASE_PORT),
                connectionLimit: 5,
                allowPublicKeyRetrieval: true,
            })
        });

        Graceful.registerProcessForShutdown("prisma-sql-connection", () => {
            this.prisma.$disconnect()
        })

        this.prisma = this.prisma.$extends(ulidExtension) as PrismaClient
    }

    public static getInstance(): PrismaInstance {
        if (!PrismaInstance.instance) {
            PrismaInstance.instance = new PrismaInstance();
        }
        return PrismaInstance.instance;
    }
    public getPrismaClient(): PrismaClient {
        return this.prisma;
    }

}

export const prisma: PrismaClient = PrismaInstance.getInstance().getPrismaClient();
