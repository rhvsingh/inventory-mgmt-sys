import { z } from "zod"

// Product Schema
export const productSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Name is required"),
    brand: z.string().optional(),
    category: z.string().optional(),
    costPrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    stockQty: z.coerce.number().int().min(0),
    minStock: z.coerce.number().int().min(0).default(5),
    barcode: z.string().optional(),
    supplierId: z.string().optional(),
})

// Customer Schema
export const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z
        .string()
        .email()
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// Supplier Schema
export const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactPerson: z.string().optional(),
    email: z
        .string()
        .email()
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// Transaction Schema
export const transactionItemSchema = z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
})

export const transactionSchema = z.object({
    type: z.enum(["SALE", "PURCHASE"]),
    items: z.array(transactionItemSchema).min(1),
    userId: z.string().optional(),
    customerId: z.string().optional(),
    supplierId: z.string().optional(),
})
