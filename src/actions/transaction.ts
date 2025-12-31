"use server"

import { Prisma } from "@prisma/client"
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import { transactionSchema } from "@/lib/schemas"
import type { Transaction } from "@/types"

export async function createTransaction(data: {
    type: "SALE" | "PURCHASE"
    customerId?: string
    supplierId?: string
    items: { productId: string; quantity: number; price: number; discount?: number }[]
}) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const { role } = session.user

    // RBAC: Clerks cannot record PURCHASES (Stock In)
    if (data.type === "PURCHASE" && role !== "ADMIN" && role !== "MANAGER") {
        return { error: "Unauthorized. Clerks cannot record purchases." }
    }

    const validatedData = transactionSchema.safeParse(data)

    if (!validatedData.success) {
        return { error: "Invalid data" }
    }

    const { type, items } = validatedData.data
    // Calculate total: (qty * price) - discount
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0)

    // Attribute to the actual user
    const userId = session.user.id

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Transaction
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
                    create: items.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: new Prisma.Decimal(item.price),
                        discount: new Prisma.Decimal(item.discount || 0),
                    })),
                },
            }

            await tx.transaction.create({
                data: transactionData,
            })

            // 2. Update Product Stock and Cost (WAC for Purchases)
            for (const item of items) {
                const qtyChange = type === "PURCHASE" ? item.quantity : -item.quantity

                if (type === "PURCHASE") {
                    const currentProduct = await tx.product.findUnique({
                        where: { id: item.productId },
                        select: { stockQty: true, costPrice: true },
                    })

                    if (currentProduct) {
                        const currentStock = currentProduct.stockQty
                        const currentCost = Number(currentProduct.costPrice)
                        const newStock = item.quantity
                        // Effective unit cost considering line discount
                        const totalLineCost = item.quantity * item.price - (item.discount || 0)
                        const unitCost = totalLineCost / item.quantity

                        let newCostPrice = currentCost
                        const finalStock = currentStock + newStock

                        // Weighted Average Cost Calculation
                        if (currentStock <= 0) {
                            // If we had no stock (or negative), the new cost is just the incoming cost
                            newCostPrice = unitCost
                        } else {
                            // (Old Value + New Value) / Total Qty
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
                        // Fallback if product not found (shouldn't happen due to FK)
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stockQty: { increment: qtyChange } },
                        })
                    }
                } else {
                    // Sale: Just update stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQty: { increment: qtyChange },
                        },
                    })
                }
            }
        })
    } catch (error) {
        console.error("Transaction failed:", error)
        return { error: "Transaction failed" }
    }

    revalidateTag("transactions", "minutes")
    revalidateTag("products", "minutes") // Stock changes, so invalidate products too
    revalidateTag("reports", "minutes") // Sales/purchases change reports

    revalidatePath("/products")
    revalidatePath("/purchases")
    revalidatePath("/sales")

    // If we redirect here, the client component's try/catch block will catch the NEXT_REDIRECT error
    // and treat it as a failure. Instead, we return success and let the client handle navigation.
    return { success: true }
}

export async function getTransactions(
    type?: "SALE" | "PURCHASE",
    page: number = 1,
    limit: number = 50,
    search?: string,
    customerId?: string,
    supplierId?: string
): Promise<{ data: Transaction[]; metadata: { total: number; page: number; totalPages: number } }> {
    "use cache"
    cacheTag(
        "transactions",
        type ? type.toLowerCase() : "all",
        `page-${page}`,
        search ? `search-${search}` : "no-search",
        customerId ? `customer-${customerId}` : "no-customer",
        supplierId ? `supplier-${supplierId}` : "no-supplier"
    )
    cacheLife("minutes")

    const skip = (page - 1) * limit

    const where: Prisma.TransactionWhereInput = {
        ...(type ? { type } : {}),
        ...(customerId ? { customerId } : {}),
        ...(supplierId ? { supplierId } : {}),
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

    const totalPages = Math.ceil(total / limit)

    return {
        data: serializePrisma(transactions),
        metadata: {
            total,
            page,
            totalPages,
        },
    }
}
