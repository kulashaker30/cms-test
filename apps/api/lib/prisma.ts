import { PrismaClient } from '@prisma/client';  // ✅ not '.prisma/client'
export const prisma = new PrismaClient();
