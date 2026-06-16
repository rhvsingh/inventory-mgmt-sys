export type Permission = string & { readonly __brand?: "Permission" }

export interface AuthUser {
    id: string
    role: string
    permissions: string[]
    name?: string | null
    email?: string | null
}

export type Action =
    // ─── Products ─────────────────────────────────────────────────
    | "products:create"
    | "products:read"
    | "products:update"
    | "products:delete"
    | "products:archive"
    | "products:import"
    // ─── Transactions ─────────────────────────────────────────────
    | "transactions:create"
    | "transactions:read"
    // ─── Adjustments ──────────────────────────────────────────────
    | "adjustments:create"
    // ─── Users ────────────────────────────────────────────────────
    | "users:create"
    | "users:read"
    | "users:update"
    | "users:delete"
    // ─── Roles ────────────────────────────────────────────────────
    | "roles:create"
    | "roles:read"
    | "roles:update"
    | "roles:delete"
    // ─── Reports ──────────────────────────────────────────────────
    | "reports:read_low_stock"
    | "reports:read_history"
    | "reports:read_valuation"
    // ─── Notifications ────────────────────────────────────────────
    | "notifications:read"

export interface ResourceAttributes {
    [key: string]: unknown
}

export type PolicyDecision =
    | { allowed: true; conditions?: Record<string, unknown> }
    | { allowed: false; reason: string }

export type PolicyFn = (user: AuthUser, attrs?: ResourceAttributes) => PolicyDecision

export interface EnforceResult {
    session: {
        user: AuthUser
    }
    conditions?: Record<string, unknown>
}
