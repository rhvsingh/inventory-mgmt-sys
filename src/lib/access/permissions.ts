import type { Action, Permission } from "./types"

// Helper to enforce type safety on permission strings
const p = <T extends string>(permission: T): T & Permission => permission as T & Permission

/**
 * Permission Registry — Single source of truth for ALL permissions in the system.
 *
 * Every permission is atomic: one permission = one specific operation.
 * Permission names follow the "resource:action" convention and must match
 * the `name` column in the database `Permission` table.
 */
export const PERMISSIONS = {
    // ─── PRODUCTS ─────────────────────────────────────────────────
    product: {
        create: p("products:create"),
        read: p("products:read"),
        update: p("products:update"),
        archive: p("products:archive"),
        delete: p("products:delete"),
        import: p("products:import"),
    },

    // ─── TRANSACTIONS ─────────────────────────────────────────────
    transaction: {
        create: p("transactions:create"),
        read: p("transactions:read"),
    },

    // ─── ADJUSTMENTS ──────────────────────────────────────────────
    adjustment: {
        create: p("adjustments:create"),
    },

    // ─── USERS ────────────────────────────────────────────────────
    user: {
        create: p("users:create"),
        read: p("users:read"),
        update: p("users:update"),
        delete: p("users:delete"),
    },

    // ─── ROLES ────────────────────────────────────────────────────
    role: {
        create: p("roles:create"),
        read: p("roles:read"),
        update: p("roles:update"),
        delete: p("roles:delete"),
    },

    // ─── REPORTS ──────────────────────────────────────────────────
    report: {
        low_stock: p("reports:low_stock"),
        valuation: p("reports:valuation"),
        history: p("reports:history"),
    },

    // ─── NOTIFICATIONS ────────────────────────────────────────────
    notification: {
        read: p("notifications:read"),
    },
} as const

/**
 * Flat list of all permission strings for validation/iteration.
 */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS).flatMap((resource) =>
    Object.values(resource),
) as Permission[]

/**
 * Maps every Action to the exact DB permission string it requires.
 * Every entry is a 1:1 mapping — no more coarse "write"/"manage" bundles.
 */
export const actionToPermissionMap: Record<Action, Permission> = {
    // Products
    "products:create": PERMISSIONS.product.create,
    "products:read": PERMISSIONS.product.read,
    "products:update": PERMISSIONS.product.update,
    "products:delete": PERMISSIONS.product.delete,
    "products:archive": PERMISSIONS.product.archive,
    "products:import": PERMISSIONS.product.import,
    // Transactions
    "transactions:create": PERMISSIONS.transaction.create,
    "transactions:read": PERMISSIONS.transaction.read,
    // Adjustments
    "adjustments:create": PERMISSIONS.adjustment.create,
    // Users
    "users:create": PERMISSIONS.user.create,
    "users:read": PERMISSIONS.user.read,
    "users:update": PERMISSIONS.user.update,
    "users:delete": PERMISSIONS.user.delete,
    // Roles
    "roles:create": PERMISSIONS.role.create,
    "roles:read": PERMISSIONS.role.read,
    "roles:update": PERMISSIONS.role.update,
    "roles:delete": PERMISSIONS.role.delete,
    // Reports
    "reports:read_low_stock": PERMISSIONS.report.low_stock,
    "reports:read_history": PERMISSIONS.report.history,
    "reports:read_valuation": PERMISSIONS.report.valuation,
    // Notifications
    "notifications:read": PERMISSIONS.notification.read,
}
