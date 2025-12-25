"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const updatePasswordSchema = z.object({
    userId: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    currentPassword: z.string().optional(), // Required for self-update, not for admin reset
})

export async function updatePassword(data: z.infer<typeof updatePasswordSchema>) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const { userId, newPassword, currentPassword } = updatePasswordSchema.parse(data)
    const currentUser = session.user

    // 1. Check Permissions
    const isSelfUpdate = currentUser.id === userId
    const isAdmin = currentUser.role === "ADMIN"

    if (!isSelfUpdate && !isAdmin) {
        return { error: "Unauthorized. You can only change your own password." }
    }

    try {
        // 2. If Self-Update, verify current password
        if (isSelfUpdate && !isAdmin) {
            if (!currentPassword) {
                return { error: "Current password is required" }
            }

            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (!user) return { error: "User not found" }

            const isValid = await bcrypt.compare(currentPassword, user.password)
            if (!isValid) {
                return { error: "Incorrect current password" }
            }
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 4. Update Database
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        })

        revalidatePath("/users")
        return { success: true }
    } catch (error) {
        console.error("Failed to update password:", error)
        return { error: "Failed to update password" }
    }
}

const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
})

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const { name, email } = updateProfileSchema.parse(data)
    const userId = session.user.id

    try {
        // Check if email is taken by another user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser && existingUser.id !== userId) {
            return { error: "Email is already in use by another account" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { name, email },
        })

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { error: "Failed to update profile" }
    }
}
