import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    // 1. Seed Permissions — Atomic, one permission per operation
    const permissionsData = [
        // ─── Products ─────────────────────────────────────────────
        { name: "products:create", description: "Create new products" },
        { name: "products:read", description: "View catalog products" },
        { name: "products:update", description: "Update existing products" },
        { name: "products:archive", description: "Archive and unarchive products" },
        { name: "products:delete", description: "Permanently delete products" },
        { name: "products:import", description: "Bulk import products via CSV" },
        // ─── Transactions ─────────────────────────────────────────
        {
            name: "transactions:create",
            description: "Create sales and purchase transactions",
        },
        { name: "transactions:read", description: "View transaction history" },
        // ─── Adjustments ──────────────────────────────────────────
        { name: "adjustments:create", description: "Create stock adjustments" },
        // ─── Users ────────────────────────────────────────────────
        { name: "users:create", description: "Create user accounts" },
        { name: "users:read", description: "View user list and details" },
        { name: "users:update", description: "Update user accounts and profiles" },
        { name: "users:delete", description: "Delete user accounts" },
        // ─── Roles ────────────────────────────────────────────────
        { name: "roles:create", description: "Create new roles" },
        { name: "roles:read", description: "View roles and permissions list" },
        {
            name: "roles:update",
            description: "Update roles and permission mappings",
        },
        { name: "roles:delete", description: "Delete roles" },
        // ─── Reports ──────────────────────────────────────────────
        { name: "reports:low_stock", description: "View low stock reports" },
        {
            name: "reports:valuation",
            description: "View inventory valuation reports",
        },
        { name: "reports:history", description: "View sales history reports" },
        // ─── Notifications ────────────────────────────────────────
        {
            name: "notifications:read",
            description: "Read stock alert notifications",
        },
    ]

    console.log("Seeding permissions...")
    const permissions: Record<string, { id: string }> = {}
    for (const p of permissionsData) {
        permissions[p.name] = await prisma.permission.upsert({
            where: { name: p.name },
            update: { description: p.description },
            create: p,
        })
    }

    // Clean up stale permissions that no longer exist in the atomic set
    const validNames = permissionsData.map((p) => p.name)
    const stalePermissions = await prisma.permission.findMany({
        where: { name: { notIn: validNames } },
    })
    if (stalePermissions.length > 0) {
        console.log(
            `Cleaning up ${stalePermissions.length} stale permission(s):`,
            stalePermissions.map((p) => p.name),
        )
        // Remove stale role-permission mappings first
        await prisma.rolePermission.deleteMany({
            where: { permissionId: { in: stalePermissions.map((p) => p.id) } },
        })
        // Then remove the stale permissions
        await prisma.permission.deleteMany({
            where: { id: { in: stalePermissions.map((p) => p.id) } },
        })
    }

    // 2. Seed Roles
    const rolesData = [
        { name: "Admin", description: "Full system administration" },
        { name: "Manager", description: "Inventory and transaction management" },
        { name: "Clerk", description: "Store sales and stock check operations" },
    ]

    console.log("Seeding roles...")
    const roles: Record<string, { id: string }> = {}
    for (const r of rolesData) {
        roles[r.name] = await prisma.role.upsert({
            where: { name: r.name },
            update: { description: r.description },
            create: r,
        })
    }

    // 3. Map Permissions to Roles
    console.log("Mapping permissions to roles...")

    // Clear existing mappings for default roles to ensure clean sync
    await prisma.rolePermission.deleteMany({
        where: {
            roleId: { in: Object.values(roles).map((r) => r.id) },
        },
    })

    // Admin — gets ALL permissions
    const adminPermissions = Object.keys(permissions)
    await prisma.rolePermission.createMany({
        data: adminPermissions.map((name) => ({
            roleId: roles["Admin"].id,
            permissionId: permissions[name].id,
        })),
    })

    // Manager — everything except delete products, user/role management
    const managerPermissions = [
        "products:create",
        "products:read",
        "products:update",
        "products:archive",
        "products:import",
        "transactions:create",
        "transactions:read",
        "adjustments:create",
        "reports:low_stock",
        "reports:valuation",
        "reports:history",
        "notifications:read",
    ]
    await prisma.rolePermission.createMany({
        data: managerPermissions.map((name) => ({
            roleId: roles["Manager"].id,
            permissionId: permissions[name].id,
        })),
    })

    // Clerk — read products, sales transactions, limited adjustments, basic reports
    const clerkPermissions = [
        "products:read",
        "transactions:create",
        "transactions:read",
        "adjustments:create",
        "reports:low_stock",
        "reports:history",
        "notifications:read",
    ]
    await prisma.rolePermission.createMany({
        data: clerkPermissions.map((name) => ({
            roleId: roles["Clerk"].id,
            permissionId: permissions[name].id,
        })),
    })

    // 4. Seed Default Admin User
    const email = "admin@example.com"
    const password = await bcrypt.hash("password123", 10)

    console.log("Seeding default admin user...")
    const adminUser = await prisma.user.upsert({
        where: { email },
        update: {
            roleId: roles["Admin"].id,
        },
        create: {
            email,
            name: "Admin User",
            password,
            roleId: roles["Admin"].id,
        },
    })

    // 5. Seed Default Clerk User for testing
    const clerkEmail = "clerk@test.com"
    const clerkPassword = await bcrypt.hash("password123", 10)

    console.log("Seeding default clerk user...")
    const clerkUser = await prisma.user.upsert({
        where: { email: clerkEmail },
        update: {
            roleId: roles["Clerk"].id,
        },
        create: {
            email: clerkEmail,
            name: "Test Clerk",
            password: clerkPassword,
            roleId: roles["Clerk"].id,
        },
    })

    console.log("Seeding completed successfully!", { adminUser, clerkUser })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
