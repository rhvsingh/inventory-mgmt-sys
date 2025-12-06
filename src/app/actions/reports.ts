"use server"

import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"

export async function getLowStockReport() {
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
    })
    return serializePrisma(products)
}

export async function getInventoryValuation() {
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

    return { params: valuation, products: serializePrisma(products) }
}

export async function getSalesHistory() {
    const transactions = await prisma.transaction.findMany({
        where: {
            type: "SALE",
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            date: "desc",
        },
        take: 50, // Limit to last 50 sales for now
    })
    return serializePrisma(transactions)
}
