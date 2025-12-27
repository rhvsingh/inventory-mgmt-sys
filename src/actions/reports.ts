"use server"

import type { Prisma } from "@prisma/client"
import { cacheLife, cacheTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { LowStockReportItem, SalesHistoryItem, ValuationReport } from "@/types"

export async function getLowStockReport(): Promise<LowStockReportItem[]> {
    "use cache"
    cacheTag("reports", "low-stock-report")
    cacheLife("minutes")

    const products = await prisma.product.findMany({
        where: {
            stockQty: {
                lte: prisma.product.fields.minStock,
            },
            isArchived: false,
        },
        orderBy: {
            stockQty: "asc",
        },
        select: {
            id: true,
            sku: true,
            name: true,
            stockQty: true,
            minStock: true,
        },
    })
    return products
}

export async function getInventoryValuation(): Promise<ValuationReport> {
    "use cache"
    cacheTag("reports", "inventory-valuation")
    cacheLife("minutes")

    const products = await prisma.product.findMany({
        where: {
            isArchived: false,
        },
        select: {
            id: true,
            name: true,
            sku: true,
            stockQty: true,
            costPrice: true,
            salePrice: true,
        },
    })

    const valuation = products.reduce(
        (acc, product) => {
            const qty = product.stockQty
            const cost = Number(product.costPrice)
            const sale = Number(product.salePrice)

            return {
                totalCost: acc.totalCost + qty * cost,
                totalRetail: acc.totalRetail + qty * sale,
                itemCount: acc.itemCount + qty,
            }
        },
        { totalCost: 0, totalRetail: 0, itemCount: 0 }
    )

    return {
        params: valuation,
        products: products.map((p) => ({
            ...p,
            costPrice: Number(p.costPrice),
            salePrice: Number(p.salePrice),
        })),
    }
}

export async function getSalesHistory(): Promise<SalesHistoryItem[]> {
    "use cache"
    cacheTag("reports", "sales-history")
    cacheLife("minutes")

    const include = {
        user: {
            select: {
                name: true,
                email: true,
            },
        },
        items: {
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
            },
        },
    } satisfies Prisma.TransactionInclude

    const transactions = await prisma.transaction.findMany({
        where: {
            type: "SALE",
        },
        include,
        orderBy: {
            date: "desc",
        },
        take: 50,
    })

    // Explicitly define the expected structure to avoid 'any' and handle stale Prisma types
    interface TransactionWithRelations {
        id: string
        date: Date
        total: Prisma.Decimal
        user: { name: string | null; email: string | null } | null
        items: {
            id: string
            quantity: number
            product: { name: string } | null
        }[]
    }

    // Cast the result to the explicit structure.
    // This is safe because the db query above ensures this shape, even if local Prisma types are stale.
    const safeTransactions = transactions as unknown as TransactionWithRelations[]

    return safeTransactions.map((t) => ({
        id: t.id,
        date: t.date,
        total: Number(t.total),
        user: t.user,
        items: t.items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            product: {
                name: i.product?.name || "Unknown",
            },
        })),
    }))
}
