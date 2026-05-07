import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/inventapro',
  })
  return new PrismaClient({ adapter })
}

export const prisma = global.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
