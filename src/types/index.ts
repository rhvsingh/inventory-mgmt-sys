// Re-export Prisma types if needed, or define frontend-safe versions

export interface Product {
    id: string
    sku: string
    name: string
    brand: string | null
    category: string | null
    description: string | null
    imageUrl: string | null
    barcode: string | null
    costPrice: number
    salePrice: number
    stockQty: number
    minStock: number
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
    supplierId: string | null
    supplier?: {
        id: string
        name: string
    } | null
}

export interface TransactionItem {
    id: string
    transactionId: string
    productId: string
    quantity: number
    price: number
    discount: number
    product?: Product
}

export interface PermissionDB {
    id: string
    name: string
    description: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
}

export interface RoleDB {
    id: string
    name: string
    description: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions: {
        permission: PermissionDB
    }[]
    _count?: {
        users: number
    }
}

export interface User {
    id: string
    name: string
    email: string
    role: string
    createdAt?: Date | string
    updatedAt?: Date | string
}

export interface Transaction {
    id: string
    type: "SALE" | "PURCHASE"
    date: Date
    total: number
    userId: string
    user?: Partial<User> | null
    items: TransactionItem[]
    customerId?: string | null
    customer?: Customer | null
    supplierId?: string | null
    supplier?: Supplier | null
}

export interface Customer {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Supplier {
    id: string
    name: string
    contactPerson: string | null
    email: string | null
    phone: string | null
    address: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Adjustment {
    id: string
    productId: string
    userId: string
    reason: string
    qtyChange: number
    createdAt: Date
    product?: Product
}

export interface ActionState<T = unknown> {
    error?: string
    success?: boolean | string // Allow boolean true or string message
    issues?: {
        message: string
        path: (string | number)[]
    }[]
    data?: T
}

// Reports
export interface LowStockReportItem {
    id: string
    sku: string
    name: string
    stockQty: number
    minStock: number
}

export interface ValuationReport {
    params: {
        totalCost: number
        totalRetail: number
        itemCount: number
    }
    products: {
        id: string
        sku: string
        name: string
        stockQty: number
        costPrice: number
        salePrice: number
    }[]
}

export interface SalesHistoryItem {
    id: string
    date: Date
    total: number
    user?: {
        name: string | null
        email: string | null
    } | null
    items: {
        id: string
        quantity: number
        product: {
            name: string
        }
    }[]
}

export interface ProfitLossSummary {
    totalRevenue: number
    totalCostOfGoodsSold: number
    grossProfit: number
    transactionCount: number
}

export interface TopProductItem {
    id: string
    name: string
    sku: string
    quantitySold: number
    revenue: number
}

export interface SupplierStats {
    id: string
    name: string
    totalPurchased: number
    transactionCount: number
}

export interface CustomerStats {
    id: string
    name: string
    totalSpent: number
    visitCount: number
}

export interface PurchaseSummary {
    totalSpend: number
    count: number
    avgValue: number
}

export interface EntitySummary {
    totalCount: number
    activeCount: number // engaged in at least one transaction
    topPerformerName: string
    topPerformerValue: number
}
