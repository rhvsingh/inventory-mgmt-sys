"use server"

import "server-only"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import type { AuthUser } from "@/lib/access/types"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"

export async function checkLowStock(): Promise<{ id: string; name: string; stockQty: number; minStock: number }[]> {
    const session = await auth()
    if (!session?.user) return []

    const authCheck = Authz.check(session.user as AuthUser, "notifications:read")
    if (!authCheck.authorized) return []

    const lowStockProducts = await prisma.product.findMany({
        where: {
            stockQty: {
                lte: prisma.product.fields.minStock,
            },
            isArchived: false,
        },
        select: {
            id: true,
            name: true,
            stockQty: true,
            minStock: true,
        },
    })
    return serializePrisma(lowStockProducts)
}
