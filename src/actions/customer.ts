"use server"

import { revalidatePath } from "next/cache"
import type { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { customerSchema } from "@/lib/schemas"

export async function createCustomer(data: z.infer<typeof customerSchema>) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const validated = customerSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        const customer = await prisma.customer.create({
            data: validated.data,
        })
        revalidatePath("/customers")
        return { success: true, data: customer }
    } catch (error) {
        console.error("Failed to create customer:", error)
        return { error: "Failed to create customer" }
    }
}

export async function updateCustomer(id: string, data: z.infer<typeof customerSchema>) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const validated = customerSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: validated.data,
        })
        revalidatePath("/customers")
        return { success: true, data: customer }
    } catch (error) {
        console.error("Failed to update customer:", error)
        return { error: "Failed to update customer" }
    }
}

export async function deleteCustomer(id: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.customer.delete({
            where: { id },
        })
        revalidatePath("/customers")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete customer:", error)
        return { error: "Failed to delete customer" }
    }
}

export async function getCustomers({
    page = 1,
    limit = 10,
    search = "",
}: {
    page?: number
    limit?: number
    search?: string
}) {
    const session = await auth()
    if (!session?.user) return { data: [], metadata: { total: 0, pageCount: 0, currentPage: page } }

    const skip = (page - 1) * limit

    const where = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
                  { phone: { contains: search, mode: "insensitive" as const } },
              ],
          }
        : {}

    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
    ])

    return {
        data: customers,
        metadata: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: page,
        },
    }
}

export async function getCustomer(id: string) {
    const session = await auth()
    if (!session?.user) return null

    const customer = await prisma.customer.findUnique({
        where: { id },
    })

    return customer
}
