"use server"

import "server-only"

import type { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import type { AuthUser } from "@/lib/access/types"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"

export interface AuditLog {
    id: string
    action: string
    details: string
    userId: string
    createdAt: Date
    user: {
        name: string
        email: string
    }
}

/**
 * Helper to record activity in the AuditLog database table.
 * Resolves current session automatically.
 */
export async function logActivity(action: string, details: unknown) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            console.error("Audit log failed: No active session user found.")
            return { error: "No authenticated user" }
        }

        const detailsString = typeof details === "string" ? details : JSON.stringify(details)

        const log = await prisma.auditLog.create({
            data: {
                action,
                details: detailsString,
                userId: session.user.id,
            },
        })

        revalidatePath("/audit-logs")
        return { success: true, log }
    } catch (e) {
        console.error("Failed to write audit log:", e)
        return { error: "Failed to write audit log" }
    }
}

/**
 * Reads paginated and filterable audit logs from the database.
 * Restricted to users with audit_logs:read permission (Admins).
 */
export async function getAuditLogs({
    page = 1,
    limit = 50,
    search = "",
    action = "",
}: {
    page?: number
    limit?: number
    search?: string
    action?: string
} = {}): Promise<{
    data: AuditLog[]
    metadata: { total: number; pageCount: number; currentPage: number }
}> {
    const session = await auth()
    if (!session?.user) {
        return { data: [], metadata: { total: 0, pageCount: 0, currentPage: page } }
    }

    const authCheck = Authz.check(session.user as AuthUser, "audit_logs:read")
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }

    // Clamp pagination bounds
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100)
    const skip = (safePage - 1) * safeLimit

    const where: Prisma.AuditLogWhereInput = {}

    if (action) {
        where.action = action
    }

    if (search) {
        where.OR = [
            { action: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
            {
                user: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
            },
        ]
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: safeLimit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.auditLog.count({ where }),
        ])

        return {
            data: serializePrisma(logs) as AuditLog[],
            metadata: {
                total,
                pageCount: Math.ceil(total / safeLimit),
                currentPage: safePage,
            },
        }
    } catch (error) {
        console.error("Failed to query audit logs:", error)
        return { data: [], metadata: { total: 0, pageCount: 0, currentPage: page } }
    }
}
