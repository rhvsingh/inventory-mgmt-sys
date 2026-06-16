"use server"

import "server-only"
import { Prisma } from "@prisma/client"
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { logActivity } from "@/actions/audit"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import type { Transaction } from "@/types"

const transactionItemSchema = z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).optional(),
})

const transactionSchema = z.object({
    type: z.enum(["SALE", "PURCHASE"]),
    items: z.array(transactionItemSchema).min(1),
    userId: z.string().optional(),
    customerId: z.string().optional(),
    supplierId: z.string().optional(),
})

type TransactionForExport = Prisma.TransactionGetPayload<{
    include: {
        user: { select: { name: true } }
        customer: { select: { name: true } }
        supplier: { select: { name: true } }
        items: {
            include: {
                product: { select: { name: true; sku: true } }
            }
        }
    }
}>

export async function createTransaction(data: {
    type: "SALE" | "PURCHASE"
    items: { productId: string; quantity: number; price: number; discount?: number }[]
    customerId?: string
    supplierId?: string
}) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    // ABAC/RBAC validation
    const authCheck = Authz.check(session.user, "transactions:create", {
        transaction: { userId: session.user.id, type: data.type },
    })
    if (!authCheck.authorized) {
        return { error: authCheck.reason || "Unauthorized" }
    }

    const validatedData = transactionSchema.safeParse(data)
    if (!validatedData.success) {
        return { error: "Invalid data" }
    }

    const { type, items, customerId, supplierId } = validatedData.data
    const total = items.reduce((sum, item) => sum + item.quantity * item.price - (item.discount || 0), 0)

    const userId = session.user.id

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Prepare Items with Cost Snapshot
            const transactionItemsData = []

            for (const item of items) {
                let costSnapshot = new Prisma.Decimal(0)

                if (type === "SALE") {
                    const product = await tx.product.findUnique({ where: { id: item.productId } })
                    costSnapshot = product?.costPrice || new Prisma.Decimal(0)
                } else {
                    costSnapshot = new Prisma.Decimal(item.price)
                }

                transactionItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: new Prisma.Decimal(item.price),
                    discount: new Prisma.Decimal(item.discount || 0),
                    cost: costSnapshot,
                })
            }

            // 2. Create Transaction
            const transactionData: Prisma.TransactionCreateInput = {
                type,
                total: new Prisma.Decimal(total),
                user: { connect: { id: userId } },
                customer: validatedData.data.customerId
                    ? { connect: { id: validatedData.data.customerId } }
                    : undefined,
                supplier: validatedData.data.supplierId
                    ? { connect: { id: validatedData.data.supplierId } }
                    : undefined,
                items: {
                    create: transactionItemsData.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount,
                        cost: item.cost,
                    })),
                },
            }

            await tx.transaction.create({
                data: transactionData,
            })

            // 3. Update Product Stock and Cost (WAC for Purchases)
            for (const item of items) {
                const qtyChange = type === "PURCHASE" ? item.quantity : -item.quantity

                // SEC-04: Prevent negative stock on SALE
                if (type === "SALE") {
                    const saleProduct = await tx.product.findUnique({
                        where: { id: item.productId },
                        select: { stockQty: true, name: true },
                    })
                    if (saleProduct && saleProduct.stockQty + qtyChange < 0) {
                        throw new Error(
                            `Insufficient stock for "${saleProduct.name}". Available: ${saleProduct.stockQty}, selling: ${item.quantity}.`,
                        )
                    }
                }

                if (type === "PURCHASE") {
                    const currentProduct = await tx.product.findUnique({
                        where: { id: item.productId },
                        select: { stockQty: true, costPrice: true },
                    })

                    if (currentProduct) {
                        const currentStock = currentProduct.stockQty
                        const currentCost = Number(currentProduct.costPrice)
                        const newStock = item.quantity
                        const totalLineCost = item.quantity * item.price - (item.discount || 0)
                        const unitCost = totalLineCost / item.quantity

                        let newCostPrice = currentCost
                        const finalStock = currentStock + newStock

                        if (currentStock <= 0) {
                            newCostPrice = unitCost
                        } else {
                            const totalValue = currentStock * currentCost + totalLineCost
                            newCostPrice = totalValue / finalStock
                        }

                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                stockQty: { increment: qtyChange },
                                costPrice: newCostPrice,
                            },
                        })
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stockQty: { increment: qtyChange } },
                        })
                    }
                } else {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQty: { increment: qtyChange },
                        },
                    })
                }
            }
        })
        await logActivity("TRANSACTION_CREATE", { type, customerId, supplierId, itemsCount: items.length })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Transaction failed"
        console.error("Transaction failed:", message)
        return { error: message }
    }

    revalidateTag("transactions", "minutes")
    revalidateTag("products", "minutes")
    revalidateTag("reports", "minutes")

    revalidatePath("/products")
    revalidatePath("/purchases")
    revalidatePath("/sales")

    return { success: true }
}

export async function getTransactions(
    type?: "SALE" | "PURCHASE",
    page: number = 1,
    limit: number = 50,
    search?: string,
    customerId?: string,
    supplierId?: string,
): Promise<{
    data: Transaction[]
    metadata: { total: number; page: number; totalPages: number }
}> {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const authCheck = Authz.check(session.user, "transactions:read")
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }

    // ABAC Rule: CLERK can only view transactions they created
    const isClerk = session.user.role === "Clerk"
    const userIdFilter = isClerk ? session.user.id : undefined

    // SEC-09: Clamp pagination bounds
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100)

    const { transactions, total } = await getCachedTransactions(
        type,
        safePage,
        safeLimit,
        search,
        customerId,
        supplierId,
        userIdFilter,
    )
    const totalPages = Math.ceil(total / safeLimit)

    return {
        data: serializePrisma(transactions) as Transaction[],
        metadata: {
            total,
            page: safePage,
            totalPages,
        },
    }
}

const getCachedTransactions = async (
    type?: "SALE" | "PURCHASE",
    page: number = 1,
    limit: number = 50,
    search?: string,
    customerId?: string,
    supplierId?: string,
    userIdFilter?: string,
) => {
    "use cache"
    cacheTag(
        "transactions",
        type ? type.toLowerCase() : "all",
        `page-${page}`,
        search ? `search-${search}` : "no-search",
        customerId ? `customer-${customerId}` : "no-customer",
        supplierId ? `supplier-${supplierId}` : "no-supplier",
        userIdFilter ? `user-${userIdFilter}` : "all-users",
    )
    cacheLife("minutes")

    const skip = (page - 1) * limit

    const where: Prisma.TransactionWhereInput = {
        ...(type ? { type } : {}),
        ...(customerId ? { customerId } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(userIdFilter ? { userId: userIdFilter } : {}),
        ...(search
            ? {
                  OR: [
                      {
                          customer: {
                              name: { contains: search, mode: "insensitive" },
                          },
                      },
                      {
                          items: {
                              some: {
                                  product: {
                                      name: { contains: search, mode: "insensitive" },
                                  },
                              },
                          },
                      },
                      {
                          id: { contains: search, mode: "insensitive" },
                      },
                  ],
              }
            : {}),
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                customer: true,
                supplier: true,
            },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.transaction.count({
            where,
        }),
    ])

    return { transactions, total }
}

export interface ExportedTransaction {
    id: string
    date: Date
    type: string
    total: number
    createdBy: string
    partnerName: string
    items: string
}

export async function getAllTransactionsForExport(type?: "SALE" | "PURCHASE"): Promise<ExportedTransaction[]> {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const authCheck = Authz.check(session.user, "transactions:read")
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }

    const isClerk = session.user.role === "Clerk"
    const userIdFilter = isClerk ? session.user.id : undefined

    const where: Prisma.TransactionWhereInput = {
        ...(type ? { type } : {}),
        ...(userIdFilter ? { userId: userIdFilter } : {}),
    }

    const transactions = await prisma.transaction.findMany({
        where,
        include: {
            user: {
                select: {
                    name: true,
                },
            },
            customer: {
                select: {
                    name: true,
                },
            },
            supplier: {
                select: {
                    name: true,
                },
            },
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            sku: true,
                        },
                    },
                },
            },
        },
        orderBy: { date: "desc" },
    })

    const serialized = serializePrisma(transactions) as unknown as TransactionForExport[]

    return serialized.map((tx) => {
        const itemsList =
            tx.items
                ?.map(
                    (item) =>
                        `${item.product?.name || "Unknown Product"} (SKU: ${item.product?.sku || "N/A"}) x${item.quantity}`,
                )
                .join("; ") || ""
        return {
            id: tx.id,
            date: tx.date,
            type: tx.type,
            total: Number(tx.total),
            createdBy: tx.user?.name || "System",
            partnerName: tx.type === "SALE" ? tx.customer?.name || "Walk-in Customer" : tx.supplier?.name || "N/A",
            items: itemsList,
        }
    })
}
