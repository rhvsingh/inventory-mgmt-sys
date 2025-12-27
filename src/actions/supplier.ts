"use server"

import { revalidatePath } from "next/cache"
import type { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { supplierSchema } from "@/lib/schemas"

export async function createSupplier(data: z.infer<typeof supplierSchema>) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const validated = supplierSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.supplier.create({
            data: validated.data,
        })
        revalidatePath("/suppliers")
        return { success: true }
    } catch (error) {
        console.error("Failed to create supplier:", error)
        return { error: "Failed to create supplier" }
    }
}

export async function updateSupplier(id: string, data: z.infer<typeof supplierSchema>) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const validated = supplierSchema.safeParse(data)
    if (!validated.success) return { error: "Invalid data" }

    try {
        await prisma.supplier.update({
            where: { id },
            data: validated.data,
        })
        revalidatePath("/suppliers")
        return { success: true }
    } catch (error) {
        console.error("Failed to update supplier:", error)
        return { error: "Failed to update supplier" }
    }
}

export async function deleteSupplier(id: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.supplier.delete({
            where: { id },
        })
        revalidatePath("/suppliers")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete supplier:", error)
        return { error: "Failed to delete supplier" }
    }
}

export async function getSuppliers({
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
                  { contactPerson: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
              ],
          }
        : {}

    const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.supplier.count({ where }),
    ])

    return {
        data: suppliers,
        metadata: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: page,
        },
    }
}

export async function getAllSuppliers() {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.supplier.findMany({
        orderBy: { name: "asc" },
    })
}
