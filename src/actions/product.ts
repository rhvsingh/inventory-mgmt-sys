"use server"

import type { Prisma } from "@prisma/client"
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { serializePrisma } from "@/lib/prisma-utils"
import { deleteImage, uploadImage } from "@/lib/upload"
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
    const session = await auth()
    const role = session?.user?.role
    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        return { error: "Unauthorized" }
    }
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
    let imageUrl: string | null = null

    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 5 * 1024 * 1024) {
            return { error: "File size must be less than 5MB" }
        }
        if (!imageFile.type.startsWith("image/")) {
            return { error: "File must be an image" }
        }
        imageUrl = await uploadImage(imageFile)
    }

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

    revalidateTag("products", "minutes")
    revalidateTag("reports", "minutes")
    revalidatePath("/products")

    const skipRedirect = formData.get("skipRedirect") === "true"
    if (skipRedirect) {
        return { success: true }
    }

    redirect("/products")
}

export async function updateProduct(
    id: string,
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const session = await auth()
    const role = session?.user?.role
    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        return { error: "Unauthorized" }
    }
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
        if (imageFile.size > 5 * 1024 * 1024) {
            return { error: "File size must be less than 5MB" }
        }
        if (!imageFile.type.startsWith("image/")) {
            return { error: "File must be an image" }
        }
        imageUrl = await uploadImage(imageFile)
    }

    // Convert empty strings to null for optional unique fields
    const dataToUpdate = {
        ...validatedData.data,
        ...({ imageUrl } as { imageUrl?: string }), // simplified
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

    revalidateTag("products", "minutes")
    revalidateTag(`product-${id}`, "minutes")
    revalidateTag("reports", "minutes")
    revalidatePath("/products")

    const skipRedirect = formData.get("skipRedirect") === "true"
    if (skipRedirect) {
        return { success: true }
    }

    redirect("/products")
}

export async function archiveProduct(id: string) {
    const session = await auth()
    const role = session?.user?.role
    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        return { error: "Unauthorized" }
    }
    try {
        await prisma.product.update({
            where: { id },
            data: { isArchived: true },
        })
        revalidateTag("products", "minutes")
        revalidateTag("reports", "minutes")
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to archive product:", error)
        return { error: "Failed to archive product" }
    }
}

export async function unarchiveProduct(id: string) {
    const session = await auth()
    const role = session?.user?.role
    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        return { error: "Unauthorized" }
    }
    try {
        await prisma.product.update({
            where: { id },
            data: { isArchived: false },
        })
        revalidateTag("products", "minutes")
        revalidateTag("reports", "minutes")
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to unarchive product:", error)
        return { error: "Failed to unarchive product" }
    }
}

export async function deleteProduct(id: string) {
    const session = await auth()
    const role = session?.user?.role
    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        return { error: "Unauthorized" }
    }

    // Check for dependencies
    const dependencyCount = await prisma.transactionItem.count({
        where: { productId: id },
    })

    if (dependencyCount > 0) {
        return { error: "Cannot delete product with existing sales or purchases. Please archive it instead." }
    }

    const adjustmentCount = await prisma.adjustment.count({
        where: { productId: id },
    })

    if (adjustmentCount > 0) {
        return { error: "Cannot delete product with inventory adjustments. Please archive it instead." }
    }

    try {
        // Fetch product to get image URL
        const product = await prisma.product.findUnique({
            where: { id },
            select: { imageUrl: true },
        })

        if (product?.imageUrl) {
            await deleteImage(product.imageUrl)
        }

        await prisma.product.delete({
            where: { id },
        })
        revalidateTag("products", "minutes")
        revalidateTag("reports", "minutes")
        revalidatePath("/products")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { error: "Failed to delete product" }
    }
}

export async function getProducts(query?: string): Promise<Product[]> {
    "use cache"
    cacheTag("products")
    cacheLife("minutes")

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
    isArchived?: boolean
}

export async function getProductsPaginated(
    query?: string,
    page: number = 1,
    limit: number = 10,
    filters?: ProductFilters
): Promise<{ products: Product[]; metadata: { total: number; page: number; totalPages: number } }> {
    "use cache"
    cacheTag("products")
    cacheLife("minutes")

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

    if (filters?.isArchived !== undefined) {
        where.isArchived = filters.isArchived
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
    "use cache"
    cacheTag("products", "product-filters")
    cacheLife("hours") // Filters change less often

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
    // Removed 'use cache' to prevent stale data on edit screens
    // "use cache"
    // cacheTag(`product-${id}`, "products")
    // cacheLife("minutes")

    const product = await prisma.product.findUnique({
        where: { id },
    })
    return serializePrisma(product)
}
