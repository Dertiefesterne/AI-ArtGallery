import { PrismaClient } from '@prisma/client'

// 复用单例，避免开发环境热重载时创建过多连接
export const prisma = new PrismaClient()
