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

// ... existing code

export interface ProfitLossSummary {
    totalRevenue: number
    totalCostOfGoodsSold: number
    grossProfit: number
    transactionCount: number
}

// Calculate Profit & Loss based on SALES transactions
export async function getProfitLossReport(
    startDate?: Date,
    endDate?: Date
): Promise<ProfitLossSummary> {
    "use cache"
    cacheTag("reports", "profit-loss")
    cacheLife("minutes")

    const where: Prisma.TransactionWhereInput = {
        type: "SALE",
        ...(startDate && endDate ? {
            date: {
                gte: startDate,
                lte: endDate
            }
        } : {})
    }

    const sales = await prisma.transaction.findMany({
        where,
        include: {
            items: true // We need items to calculate cost at time of sale? 
            // Ideally we should snapshot cost at time of sale. 
            // CURRENT LIMITATION: We don't have cost snapshot on TransactionItem.
            // We only have current Product.costPrice. 
            // For now, we will use (Sale Price - Current Cost Price) * Qty.
            // FUTURE IMPROVEMENT: Add 'cost' field to TransactionItem to snapshot historical cost.
        }
    })

    // To get COGS, we need product costs.
    // Fetch relevant products to map costs.
    // Optimization: fetch only needed products.
    const productIds = new Set<string>()
    sales.forEach(s => s.items.forEach(i => productIds.add(i.productId)))
    
    const products = await prisma.product.findMany({
        where: { id: { in: Array.from(productIds) } },
        select: { id: true, costPrice: true }
    })
    
    const productCostMap = new Map(products.map(p => [p.id, Number(p.costPrice)]))

    let totalRevenue = 0
    let totalCostOfGoodsSold = 0

    for (const sale of sales) {
        totalRevenue += Number(sale.total)
        for (const item of sale.items) {
            const cost = productCostMap.get(item.productId) || 0
            totalCostOfGoodsSold += cost * item.quantity
        }
    }

    return {
        totalRevenue,
        totalCostOfGoodsSold,
        grossProfit: totalRevenue - totalCostOfGoodsSold,
        transactionCount: sales.length
    }
}

export interface TopProductItem {
    id: string
    name: string
    sku: string
    quantitySold: number
    revenue: number
}

export async function getTopSellingProducts(limit = 10): Promise<TopProductItem[]> {
    "use cache"
    cacheTag("reports", "top-selling")
    cacheLife("minutes")

    // Aggregate transaction items for SALES
    const result = await prisma.transactionItem.groupBy({
        by: ['productId'],
        where: {
            transaction: {
                type: "SALE"
            }
        },
        _sum: {
            quantity: true,
            // We can't easily sum (price * quantity) directly in groupBy without raw query or post-proccessing
            // Prisma doesn't support multiplying fields in aggregate.
        },
    })

    // We also need revenue. Let's do a raw query for efficiency or generic findMany.
    // For "Top Selling", quantity is usually the metric, or Revenue.
    // Let's stick to Quantity for the simple grouping, but fetch details.
    
    // Actually, to get Revenue we need to look at the items. 
    // Let's use findMany on TransactionItems for SALES.
    
    // Grouping in application code might be safer for non-raw queries.
    const items = await prisma.transactionItem.findMany({
        where: {
            transaction: { type: "SALE" }
        },
        select: {
            productId: true,
            quantity: true,
            price: true, // This is sale price per unit
            product: {
                select: {
                    name: true,
                    sku: true
                }
            }
        }
    })

    const productMap = new Map<string, TopProductItem>()

    for (const item of items) {
        const existing = productMap.get(item.productId)
        const revenue = item.quantity * Number(item.price)
        
        if (existing) {
            existing.quantitySold += item.quantity
            existing.revenue += revenue
        } else {
            productMap.set(item.productId, {
                id: item.productId,
                name: item.product?.name || "Unknown",
                sku: item.product?.sku || "-",
                quantitySold: item.quantity,
                revenue
            })
        }
    }

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue) // Sort by revenue desc
        .slice(0, limit)
}

