"use server"

import "server-only"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { z } from "zod"

import { logActivity } from "@/actions/audit"
import { auth } from "@/auth"
import { Authz } from "@/lib/access"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import type { ActionState, PermissionDB, RoleDB } from "@/types"

const getCachedRoles = async () => {
    "use cache"
    cacheTag("roles")
    cacheLife("hours")

    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    })

    return roles
}

export async function getRoles(): Promise<RoleDB[]> {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const authCheck = Authz.check(session.user, "roles:read")
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }

    const roles = await getCachedRoles()
    return serializePrisma<RoleDB[]>(roles)
}

export async function getPermissionsList(): Promise<PermissionDB[]> {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const authCheck = Authz.check(session.user, "roles:read")
    if (!authCheck.authorized) {
        throw new Error(authCheck.reason || "Unauthorized")
    }

    const permissions = await prisma.permission.findMany({
        orderBy: {
            name: "asc",
        },
    })

    return serializePrisma<PermissionDB[]>(permissions)
}

const roleSchema = z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
})

export async function createRole(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    const authCheck = Authz.check(session.user, "roles:create")
    if (!authCheck.authorized) {
        return { error: authCheck.reason || "Unauthorized" }
    }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
    }

    const validated = roleSchema.safeParse(rawData)
    if (!validated.success) {
        return {
            error: "Invalid data",
            issues: validated.error.issues.map((i) => ({
                message: i.message,
                path: i.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
            })),
        }
    }

    const permissionNames = formData.getAll("permissions") as string[]

    try {
        // Check uniqueness
        const existing = await prisma.role.findUnique({
            where: { name: validated.data.name },
        })
        if (existing) {
            return {
                error: `Role with name "${validated.data.name}" already exists.`,
            }
        }

        // Verify that all permissions requested exist in the DB
        const dbPermissions = await prisma.permission.findMany({
            where: { name: { in: permissionNames } },
        })

        await prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name: validated.data.name,
                    description: validated.data.description,
                },
            })

            if (dbPermissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: dbPermissions.map((perm) => ({
                        roleId: role.id,
                        permissionId: perm.id,
                    })),
                })
            }
        })
        await logActivity("ROLE_CREATE", { name: validated.data.name })
        revalidateTag("roles", "hours")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create role." }
    }
}

export async function updateRole(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    const authCheck = Authz.check(session.user, "roles:update")
    if (!authCheck.authorized) {
        return { error: authCheck.reason || "Unauthorized" }
    }

    const roleId = formData.get("id") as string
    if (!roleId) {
        return { error: "Role ID is missing." }
    }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
    }

    const validated = roleSchema.safeParse(rawData)
    if (!validated.success) {
        return {
            error: "Invalid data",
            issues: validated.error.issues.map((i) => ({
                message: i.message,
                path: i.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
            })),
        }
    }

    const permissionNames = formData.getAll("permissions") as string[]

    try {
        // Prevent editing system Admin role's name to preserve core security references
        const currentRole = await prisma.role.findUnique({
            where: { id: roleId },
        })
        if (!currentRole) {
            return { error: "Role not found." }
        }

        if (currentRole.name === "Admin" && validated.data.name !== "Admin") {
            return { error: "Cannot change the name of the system Admin role." }
        }

        // Check name uniqueness if changed
        if (validated.data.name !== currentRole.name) {
            const existing = await prisma.role.findUnique({
                where: { name: validated.data.name },
            })
            if (existing) {
                return {
                    error: `Role with name "${validated.data.name}" already exists.`,
                }
            }
        }

        const dbPermissions = await prisma.permission.findMany({
            where: { name: { in: permissionNames } },
        })

        await prisma.$transaction(async (tx) => {
            await tx.role.update({
                where: { id: roleId },
                data: {
                    name: validated.data.name,
                    description: validated.data.description,
                },
            })

            // Clear old permissions mapping
            await tx.rolePermission.deleteMany({
                where: { roleId },
            })

            // Create new mapping
            if (dbPermissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: dbPermissions.map((perm) => ({
                        roleId,
                        permissionId: perm.id,
                    })),
                })
            }
        })
        await logActivity("ROLE_UPDATE", { id: roleId, name: validated.data.name })
        revalidateTag("roles", "hours")
        // Also revalidate users since their permissions might have changed dynamically
        revalidateTag("users", "hours")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update role." }
    }
}

export async function deleteRole(roleId: string): Promise<ActionState> {
    const session = await auth()
    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    const authCheck = Authz.check(session.user, "roles:delete")
    if (!authCheck.authorized) {
        return { error: authCheck.reason || "Unauthorized" }
    }

    try {
        const roleToDelete = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        })

        if (!roleToDelete) {
            return { error: "Role not found." }
        }

        // Security constraint: Do not delete Admin, Manager, Clerk roles or roles with active users
        if (roleToDelete.name === "Admin") {
            return { error: "Cannot delete the system Admin role." }
        }

        if (roleToDelete._count.users > 0) {
            return {
                error: `Cannot delete role. There are ${roleToDelete._count.users} users currently assigned to this role.`,
            }
        }

        await prisma.role.delete({
            where: { id: roleId },
        })
        await logActivity("ROLE_DELETE", { id: roleId, name: roleToDelete.name })
        revalidateTag("roles", "hours")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete role." }
    }
}
