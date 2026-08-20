import { Prisma, PrismaClient, type Message } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export { Prisma, PrismaClient, type Message };

const connectionString = process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error(
    "POSTGRES_PRISMA_URL is not set. Add it to chat-service/.env."
  );
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
