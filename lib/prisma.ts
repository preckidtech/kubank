// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Ensure 'prisma' is exported as a constant
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma