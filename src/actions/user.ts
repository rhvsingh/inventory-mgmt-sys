"use server"

import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import { cacheTag, cacheLife } from "next/cache"
import { User } from "@prisma/client"

export async function getUsers(): Promise<User[]> {
    "use cache"
    cacheTag("users")
    cacheLife("hours")

    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
    })

    return serializePrisma(users)
}

import { revalidateTag } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import type { ActionState } from "@/types"

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6+ chars"),
    role: z.nativeEnum(Role).default(Role.CLERK),
})

import { auth } from "@/auth"

export async function createUser(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
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

export async function updateProfile(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
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
