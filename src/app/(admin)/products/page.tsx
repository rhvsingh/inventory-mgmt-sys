import { Plus, FileDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
    getDistinctValues,
    getProductsPaginated,
    type ProductFilters as ProductFiltersType,
} from "@/app/actions/product"
import { ProductActions } from "@/components/product-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { SearchInput } from "@/components/search-input"
import { Pagination } from "@/components/pagination"
import { ProductFilters } from "@/components/product-filters"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        page?: string
        categories?: string
        brands?: string
        minPrice?: string
        maxPrice?: string
        inStock?: string
    }>
}) {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const { q, page, categories, brands, minPrice, maxPrice, inStock } = await searchParams
    const currentPage = Number(page) || 1

    const filters: ProductFiltersType = {
        categories: categories ? categories.split(",") : undefined,
        brands: brands ? brands.split(",") : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock === "true",
    }

    const [{ products, metadata }, distinctValues] = await Promise.all([
        getProductsPaginated(q, currentPage, 10, filters),
        getDistinctValues(),
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
                    <Link href="/products/import">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <FileDown className="h-4 w-4" />
                            Import CSV
                        </Button>
                    </Link>
                    <Link href="/products/new">
                        <Button className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput />
                <ProductFilters categories={distinctValues.categories} brands={distinctValues.brands} />
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Image</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.imageUrl ? (
                                            <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <span className="text-xs text-muted-foreground">Img</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.sku}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.brand || "-"}</TableCell>
                                    <TableCell>{product.category || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(product.salePrice))}
                                    </TableCell>
                                    <TableCell className="text-right">{product.stockQty}</TableCell>
                                    <TableCell className="text-right">
                                        <ProductActions productId={product.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {metadata.totalPages > 1 && (
                    <Pagination
                        totalPages={metadata.totalPages}
                        currentPage={metadata.page}
                        totalItems={metadata.total}
                        pageSize={10}
                    />
                )}
            </div>
        </div>
    )
}
