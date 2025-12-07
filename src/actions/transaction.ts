"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { cacheTag, cacheLife } from "next/cache"

const transactionItemSchema = z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce.number().min(0),
})

const transactionSchema = z.object({
    type: z.enum(["SALE", "PURCHASE"]),
    items: z.array(transactionItemSchema).min(1),
    userId: z.string().optional(), // In real app, get from session
})

import { auth } from "@/auth"

export async function createTransaction(data: {
    type: "SALE" | "PURCHASE"
    items: { productId: string; quantity: number; price: number }[]
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
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    // Attribute to the actual user
    const userId = session.user.id

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Transaction
            await tx.transaction.create({
                data: {
                    type,
                    total,
                    userId,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            })

            // 2. Update Product Stock
            for (const item of items) {
                const qtyChange = type === "PURCHASE" ? item.quantity : -item.quantity

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQty: {
                            increment: qtyChange,
                        },
                    },
                })
                // Invalidate individual product cache if needed, but 'products' tag covers list
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

    if (type === "PURCHASE") redirect("/purchases")
    if (type === "SALE") redirect("/sales")
}

import { serializePrisma } from "@/lib/prisma-utils"
import type { Transaction } from "@/types"

// ... (createTransaction function)

export async function getTransactions(type: "SALE" | "PURCHASE"): Promise<Transaction[]> {
    "use cache"
    cacheTag("transactions", type.toLowerCase())
    cacheLife("minutes")

    const transactions = await prisma.transaction.findMany({
        where: { type },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { date: "desc" },
    })
    return serializePrisma(transactions)
}
