"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import type { z } from "zod"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import type { AuthUser } from "@/lib/access/types"
import { prisma } from "@/lib/prisma"
import { customerSchema } from "@/lib/schemas"

export async function createCustomer(data: z.infer<typeof customerSchema>) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const authCheck = Authz.check(session.user as AuthUser, "customers:create")
    if (!authCheck.authorized) return { error: authCheck.reason || "Unauthorized" }

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

    const authCheck = Authz.check(session.user as AuthUser, "customers:update")
    if (!authCheck.authorized) return { error: authCheck.reason || "Unauthorized" }

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

    const authCheck = Authz.check(session.user as AuthUser, "customers:delete")
    if (!authCheck.authorized) return { error: authCheck.reason || "Unauthorized" }

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

    const authCheck = Authz.check(session.user as AuthUser, "customers:read")
    if (!authCheck.authorized) return { data: [], metadata: { total: 0, pageCount: 0, currentPage: page } }

    // SEC-09: Clamp pagination bounds
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100)
    const skip = (safePage - 1) * safeLimit

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
            take: safeLimit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
    ])

    return {
        data: customers,
        metadata: {
            total,
            pageCount: Math.ceil(total / safeLimit),
            currentPage: safePage,
        },
    }
}

export async function getCustomer(id: string) {
    const session = await auth()
    if (!session?.user) return null

    const authCheck = Authz.check(session.user as AuthUser, "customers:read")
    if (!authCheck.authorized) return null

    const customer = await prisma.customer.findUnique({
        where: { id },
    })

    return customer
}
