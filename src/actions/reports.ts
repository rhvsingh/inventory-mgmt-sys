"use server"

import type { Prisma } from "@prisma/client"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import type { Action } from "@/lib/access/types"
import type {
    CustomerStats,
    EntitySummary,
    LowStockReportItem,
    ProfitLossSummary,
    PurchaseSummary,
    SalesHistoryItem,
    SupplierStats,
    TopProductItem,
    ValuationReport,
} from "@/types"

async function checkReportPermission(action: Action) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }
    const authCheck = Authz.check(session.user as any, action)
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }
}

// 1. Low stock report
export async function getLowStockReport(): Promise<LowStockReportItem[]> {
    await checkReportPermission("reports:read_low_stock")
    return getLowStockReportCached()
}

async function getLowStockReportCached(): Promise<LowStockReportItem[]> {
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

// 2. Inventory valuation
export async function getInventoryValuation(): Promise<ValuationReport> {
    await checkReportPermission("reports:read_valuation")
    return getInventoryValuationCached()
}

async function getInventoryValuationCached(): Promise<ValuationReport> {
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

// 3. Sales History
export async function getSalesHistory(): Promise<SalesHistoryItem[]> {
    await checkReportPermission("reports:read_history")
    return getSalesHistoryCached()
}

async function getSalesHistoryCached(): Promise<SalesHistoryItem[]> {
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

// 4. Profit loss report
export async function getProfitLossReport(startDate?: Date, endDate?: Date): Promise<ProfitLossSummary> {
    await checkReportPermission("reports:read_history")
    return getProfitLossReportCached(startDate, endDate)
}

async function getProfitLossReportCached(startDate?: Date, endDate?: Date): Promise<ProfitLossSummary> {
    "use cache"
    cacheTag("reports", "profit-loss")
    cacheLife("minutes")

    const where: Prisma.TransactionWhereInput = {
        type: "SALE",
        ...(startDate && endDate
            ? {
                  date: {
                      gte: startDate,
                      lte: endDate,
                  },
              }
            : {}),
    }

    const sales = await prisma.transaction.findMany({
        where,
        include: {
            items: {
                include: {
                    product: { select: { costPrice: true } },
                },
            },
        },
    })

    let totalRevenue = 0
    let totalCostOfGoodsSold = 0

    for (const sale of sales) {
        totalRevenue += Number(sale.total)

        for (const item of sale.items) {
            const itemCost = Number(item.product.costPrice)
            totalCostOfGoodsSold += itemCost * item.quantity
        }
    }

    return {
        totalRevenue,
        totalCostOfGoodsSold,
        grossProfit: totalRevenue - totalCostOfGoodsSold,
        transactionCount: sales.length,
    }
}

// 5. Top selling products
export async function getTopSellingProducts(limit = 10): Promise<TopProductItem[]> {
    await checkReportPermission("reports:read_history")
    return getTopSellingProductsCached(limit)
}

async function getTopSellingProductsCached(limit = 10): Promise<TopProductItem[]> {
    "use cache"
    cacheTag("reports", "top-selling")
    cacheLife("minutes")

    const items = await prisma.transactionItem.findMany({
        where: {
            transaction: { type: "SALE" },
        },
        select: {
            productId: true,
            quantity: true,
            price: true,
            discount: true,
            product: {
                select: {
                    name: true,
                    sku: true,
                },
            },
        },
    })

    const productMap = new Map<string, TopProductItem>()

    for (const item of items) {
        const existing = productMap.get(item.productId)
        const lineRevenue = item.quantity * Number(item.price) - Number(item.discount || 0)

        if (existing) {
            existing.quantitySold += item.quantity
            existing.revenue += lineRevenue
        } else {
            productMap.set(item.productId, {
                id: item.productId,
                name: item.product?.name || "Unknown",
                sku: item.product?.sku || "-",
                quantitySold: item.quantity,
                revenue: lineRevenue,
            })
        }
    }

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
}

// 6. Refresh report data
export async function refreshReportData() {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }
    // Any report permission can refresh
    const permissions = session.user.permissions || []
    const canRefresh = permissions.some((p) =>
        ["reports:read_low_stock", "reports:read_valuation", "reports:read_history"].includes(p)
    )
    if (!canRefresh) {
        throw new Error("Forbidden")
    }
    revalidateTag("reports", "max")
}

// 7. Supplier stats
export async function getSupplierStats(limit = 10): Promise<SupplierStats[]> {
    await checkReportPermission("reports:read_history")
    return getSupplierStatsCached(limit)
}

async function getSupplierStatsCached(limit = 10): Promise<SupplierStats[]> {
    "use cache"
    cacheTag("reports", "suppliers")
    cacheLife("minutes")

    const grouped = await prisma.transaction.groupBy({
        by: ["supplierId"],
        where: {
            type: "PURCHASE",
            supplierId: { not: null },
        },
        _sum: {
            total: true,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _sum: {
                total: "desc",
            },
        },
        take: limit,
    })

    const supplierIds = grouped.map((g) => g.supplierId).filter((id): id is string => id !== null)

    const suppliers = await prisma.supplier.findMany({
        where: {
            id: { in: supplierIds },
        },
        select: {
            id: true,
            name: true,
        },
    })

    const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]))

    return grouped.reduce<SupplierStats[]>((acc, g) => {
        if (g.supplierId) {
            acc.push({
                id: g.supplierId,
                name: supplierMap.get(g.supplierId) || "Unknown",
                totalPurchased: Number(g._sum.total || 0),
                transactionCount: g._count.id,
            })
        }
        return acc
    }, [])
}

// 8. Customer stats
export async function getCustomerStats(limit = 10): Promise<CustomerStats[]> {
    await checkReportPermission("reports:read_history")
    return getCustomerStatsCached(limit)
}

async function getCustomerStatsCached(limit = 10): Promise<CustomerStats[]> {
    "use cache"
    cacheTag("reports", "customers")
    cacheLife("minutes")

    const grouped = await prisma.transaction.groupBy({
        by: ["customerId"],
        where: {
            type: "SALE",
            customerId: { not: null },
        },
        _sum: {
            total: true,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _sum: {
                total: "desc",
            },
        },
        take: limit,
    })

    const customerIds = grouped.map((g) => g.customerId).filter((id): id is string => id !== null)

    const customers = await prisma.customer.findMany({
        where: {
            id: { in: customerIds },
        },
        select: {
            id: true,
            name: true,
        },
    })

    const customerMap = new Map(customers.map((c) => [c.id, c.name]))

    return grouped.reduce<CustomerStats[]>((acc, g) => {
        if (g.customerId) {
            acc.push({
                id: g.customerId,
                name: customerMap.get(g.customerId) || "Unknown",
                totalSpent: Number(g._sum.total || 0),
                visitCount: g._count.id,
            })
        }
        return acc
    }, [])
}

// 9. Purchase history
export async function getPurchaseHistory(): Promise<SalesHistoryItem[]> {
    await checkReportPermission("reports:read_history")
    return getPurchaseHistoryCached()
}

async function getPurchaseHistoryCached(): Promise<SalesHistoryItem[]> {
    "use cache"
    cacheTag("reports", "purchase-history")
    cacheLife("minutes")

    const transactions = await prisma.transaction.findMany({
        where: { type: "PURCHASE" },
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true } } } },
            supplier: true,
        },
        orderBy: { date: "desc" },
        take: 50,
    })

    return transactions.map((t) => ({
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

// 10. Purchase summary
export async function getPurchaseSummary(): Promise<PurchaseSummary> {
    await checkReportPermission("reports:read_history")
    return getPurchaseSummaryCached()
}

async function getPurchaseSummaryCached(): Promise<PurchaseSummary> {
    "use cache"
    cacheTag("reports", "purchases-summary")
    cacheLife("minutes")

    const aggregate = await prisma.transaction.aggregate({
        where: { type: "PURCHASE" },
        _sum: { total: true },
        _count: { id: true },
    })

    const totalSpend = Number(aggregate._sum.total || 0)
    const count = aggregate._count.id

    return {
        totalSpend,
        count,
        avgValue: count > 0 ? totalSpend / count : 0,
    }
}

// 11. Supplier summary
export async function getSupplierSummary(): Promise<EntitySummary> {
    await checkReportPermission("reports:read_history")
    return getSupplierSummaryCached()
}

async function getSupplierSummaryCached(): Promise<EntitySummary> {
    "use cache"
    cacheTag("reports", "suppliers-summary")
    cacheLife("minutes")

    const [totalCount, activeCount, topSupplier] = await Promise.all([
        prisma.supplier.count(),
        prisma.transaction
            .groupBy({
                by: ["supplierId"],
                where: { type: "PURCHASE", supplierId: { not: null } },
            })
            .then((res) => res.length),
        prisma.transaction.groupBy({
            by: ["supplierId"],
            where: { type: "PURCHASE", supplierId: { not: null } },
            _sum: { total: true },
            orderBy: { _sum: { total: "desc" } },
            take: 1,
        }),
    ])

    let topName = "-"
    if (topSupplier.length > 0 && topSupplier[0].supplierId) {
        const s = await prisma.supplier.findUnique({
            where: { id: topSupplier[0].supplierId },
            select: { name: true },
        })
        topName = s?.name || "Unknown"
    }

    return {
        totalCount,
        activeCount,
        topPerformerName: topName,
        topPerformerValue: Number(topSupplier[0]?._sum.total || 0),
    }
}

// 12. Customer summary
export async function getCustomerSummary(): Promise<EntitySummary> {
    await checkReportPermission("reports:read_history")
    return getCustomerSummaryCached()
}

async function getCustomerSummaryCached(): Promise<EntitySummary> {
    "use cache"
    cacheTag("reports", "customers-summary")
    cacheLife("minutes")

    const [totalCount, activeCount, topCustomer] = await Promise.all([
        prisma.customer.count(),
        prisma.transaction
            .groupBy({
                by: ["customerId"],
                where: { type: "SALE", customerId: { not: null } },
            })
            .then((res) => res.length),
        prisma.transaction.groupBy({
            by: ["customerId"],
            where: { type: "SALE", customerId: { not: null } },
            _sum: { total: true },
            orderBy: { _sum: { total: "desc" } },
            take: 1,
        }),
    ])

    let topName = "-"
    if (topCustomer.length > 0 && topCustomer[0].customerId) {
        const c = await prisma.customer.findUnique({
            where: { id: topCustomer[0].customerId },
            select: { name: true },
        })
        topName = c?.name || "Unknown"
    }

    return {
        totalCount,
        activeCount,
        topPerformerName: topName,
        topPerformerValue: Number(topCustomer[0]?._sum.total || 0),
    }
}
