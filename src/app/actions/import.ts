"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const productImportSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Name is required"),
    brand: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    costPrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    stockQty: z.coerce.number().int().min(0),
    minStock: z.coerce.number().int().min(0).default(5),
    barcode: z.string().optional().nullable(),
})

export type ImportResult = {
    success: number
    failed: number
    errors: Array<{ row: number; error: string; sku?: string }>
}

export async function importProducts(data: unknown[]): Promise<ImportResult> {
    const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
    }

    for (const [index, row] of data.entries()) {
        try {
            // Validate row
            const parseResult = productImportSchema.safeParse(row)

            if (!parseResult.success) {
                result.failed++
                result.errors.push({
                    row: index + 1,
                    error: parseResult.error.issues[0].message,
                })
                continue
            }

            const product = parseResult.data

            // Handle optional unique fields - convert empty strings to null or undefined
            const barcode = product.barcode || null
            const brand = product.brand || null
            const category = product.category || null

            // Upsert: Update if SKU exists, Create if not
            await prisma.product.upsert({
                where: { sku: product.sku },
                update: {
                    name: product.name,
                    brand,
                    category,
                    costPrice: product.costPrice,
                    salePrice: product.salePrice,
                    stockQty: product.stockQty,
                    minStock: product.minStock,
                    barcode,
                    // Don't update imageUrl on bulk import to avoid overriding with null
                },
                create: {
                    sku: product.sku,
                    name: product.name,
                    brand,
                    category,
                    costPrice: product.costPrice,
                    salePrice: product.salePrice,
                    stockQty: product.stockQty,
                    minStock: product.minStock,
                    barcode,
                },
            })

            result.success++
        } catch (error) {
            result.failed++
            console.error(`Row ${index + 1} failed:`, error)
            let errorMessage = "Database error"
            if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
                errorMessage = "Unique constraint violation (SKU or Barcode already exists)"
            }
            result.errors.push({
                row: index + 1,
                error: errorMessage,
                sku: (row as any).sku,
            })
        }
    }

    revalidatePath("/products")
    return result
}
