"use server"

import { Role, type User } from "@prisma/client"
import bcrypt from "bcryptjs"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import type { ActionState } from "@/types"

export async function getUsers(
    page: number = 1,
    limit: number = 50
): Promise<{ data: User[]; metadata: { total: number; page: number; totalPages: number } }> {
    "use cache"
    cacheTag("users", `page-${page}`)
    cacheLife("hours")

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.user.count(),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
        data: serializePrisma(users),
        metadata: {
            total,
            page,
            totalPages,
        },
    }
}

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6+ chars"),
    role: z.nativeEnum(Role).default(Role.CLERK),
})

export async function createUser(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    }

    const validated = userSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            error: "Invalid data",
            issues: validated.error.issues.map((i) => ({
                message: i.message,
                path: i.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
            })),
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(validated.data.password, 10)

        await prisma.user.create({
            data: {
                ...validated.data,
                password: hashedPassword,
            },
        })

        revalidateTag("users", "hours")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create user (Email might be taken)" }
    }
}

export async function deleteUser(userId: string): Promise<ActionState> {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        // Prevent deleting the last admin or yourself could be good, but simple for now
        await prisma.user.delete({
            where: { id: userId },
        })
        revalidateTag("users", "hours")
        return { success: true }
    } catch {
        return { error: "Failed to delete user" }
    }
}

export async function updateProfile(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
    }

    // Simple validation
    if (!rawData.name || !rawData.email) {
        return { error: "Name and email are required" }
    }

    try {
        const id = formData.get("id") as string
        if (!id) return { error: "User ID missing" }

        await prisma.user.update({
            where: { id },
            data: {
                name: rawData.name as string,
                email: rawData.email as string,
            },
        })

        revalidateTag("users", "hours") // Update users list if name changed
        return { success: true }
    } catch {
        return { error: "Failed to update profile" }
    }
}
