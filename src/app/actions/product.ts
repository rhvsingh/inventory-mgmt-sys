"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import { uploadImage } from "@/lib/upload"
import type { ActionState, Product } from "@/types"

const productSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Name is required"),
    brand: z.string().optional(),
    category: z.string().optional(),
    costPrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    stockQty: z.coerce.number().int().min(0),
    minStock: z.coerce.number().int().min(0).default(5),
    barcode: z.string().optional(),
})

export async function createProduct(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const rawData = {
        sku: formData.get("sku"),
        name: formData.get("name"),
        brand: formData.get("brand"),
        category: formData.get("category"),
        costPrice: formData.get("costPrice"),
        salePrice: formData.get("salePrice"),
        stockQty: formData.get("stockQty"),
        minStock: formData.get("minStock"),
        barcode: formData.get("barcode"),
    }

    const validatedData = productSchema.safeParse(rawData)

    if (!validatedData.success) {
        return {
            error: "Invalid data",
            issues: validatedData.error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
            })),
        }
    }

    const imageFile = formData.get("image") as File
    const imageUrl = await uploadImage(imageFile)

    // Convert empty strings to null for optional unique fields to avoid P2002
    const dataToCreate = {
        ...validatedData.data,
        imageUrl: imageUrl,
        barcode: validatedData.data.barcode || null,
        brand: validatedData.data.brand || null,
        category: validatedData.data.category || null,
    }

    try {
        await prisma.product.create({
            data: dataToCreate,
        })
    } catch (error) {
        console.error("Failed to create product:", error)
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            const field = (error as { meta?: { target?: string[] } }).meta?.target?.[0]
            return { error: `Product with this ${field} already exists.` }
        }
        return { error: "Failed to create product. Please try again." }
    }

    revalidatePath("/products")
    redirect("/products")
}

export async function updateProduct(
    id: string,
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        sku: formData.get("sku"),
        name: formData.get("name"),
        brand: formData.get("brand"),
        category: formData.get("category"),
        costPrice: formData.get("costPrice"),
        salePrice: formData.get("salePrice"),
        stockQty: formData.get("stockQty"),
        minStock: formData.get("minStock"),
        barcode: formData.get("barcode"),
    }

    const validatedData = productSchema.safeParse(rawData)

    if (!validatedData.success) {
        return {
            error: "Invalid data",
            issues: validatedData.error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
            })),
        }
    }

    const imageFile = formData.get("image") as File
    let imageUrl: string | null | undefined
    if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImage(imageFile)
    }

    // Convert empty strings to null for optional unique fields
    const dataToUpdate = {
        ...validatedData.data,
        ...(imageUrl ? { imageUrl } : {}),
        barcode: validatedData.data.barcode || null,
        brand: validatedData.data.brand || null,
        category: validatedData.data.category || null,
    }

    try {
        await prisma.product.update({
            where: { id },
            data: dataToUpdate,
        })
    } catch (error) {
        console.error("Failed to update product:", error)
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            const field = (error as { meta?: { target?: string[] } }).meta?.target?.[0]
            return { error: `Product with this ${field} already exists.` }
        }
        return { error: "Failed to update product. Please try again." }
    }

    revalidatePath("/products")
    redirect("/products")
}

export async function archiveProduct(id: string) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isArchived: true },
        })
        revalidatePath("/products")
    } catch (error) {
        console.error("Failed to archive product:", error)
        throw new Error("Failed to archive product")
    }
}

export async function getProducts(query?: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
        where: {
            isArchived: false,
            ...(query
                ? {
                      OR: [
                          { name: { contains: query, mode: "insensitive" } },
                          { sku: { contains: query, mode: "insensitive" } },
                          { brand: { contains: query, mode: "insensitive" } },
                          { category: { contains: query, mode: "insensitive" } },
                      ],
                  }
                : {}),
        },
        orderBy: { createdAt: "desc" },
    })
    return serializePrisma(products)
}

export interface ProductFilters {
    categories?: string[]
    brands?: string[]
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
}

export async function getProductsPaginated(
    query?: string,
    page: number = 1,
    limit: number = 10,
    filters?: ProductFilters
): Promise<{ products: Product[]; metadata: { total: number; page: number; totalPages: number } }> {
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
        isArchived: false,
    }

    // Search query
    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" as const } },
            { sku: { contains: query, mode: "insensitive" as const } },
            { brand: { contains: query, mode: "insensitive" as const } },
            { category: { contains: query, mode: "insensitive" as const } },
        ]
    }

    // Filters
    if (filters?.categories?.length) {
        where.category = { in: filters.categories }
    }

    if (filters?.brands?.length) {
        where.brand = { in: filters.brands }
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        where.salePrice = {}
        if (filters.minPrice !== undefined) where.salePrice.gte = filters.minPrice
        if (filters.maxPrice !== undefined) where.salePrice.lte = filters.maxPrice
    }

    if (filters?.inStock) {
        where.stockQty = { gt: 0 }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return {
        products: serializePrisma(products),
        metadata: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export async function getDistinctValues() {
    const [categories, brands] = await Promise.all([
        prisma.product.findMany({
            where: { isArchived: false, category: { not: null } },
            select: { category: true },
            distinct: ["category"],
        }),
        prisma.product.findMany({
            where: { isArchived: false, brand: { not: null } },
            select: { brand: true },
            distinct: ["brand"],
        }),
    ])

    return {
        categories: categories.map((c) => c.category).filter(Boolean) as string[],
        brands: brands.map((b) => b.brand).filter(Boolean) as string[],
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
        where: { id },
    })
    return serializePrisma(product)
}
