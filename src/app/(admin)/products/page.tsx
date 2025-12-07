import { Plus, FileDown } from "lucide-react"
import Link from "next/link"
import { getDistinctValues, getProductsPaginated, type ProductFilters as ProductFiltersType } from "@/actions/product"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/search-input"
import { ProductFilters } from "@/components/product-filters"
import { ProductListTable } from "@/components/product-list-table"

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
        archived?: string
    }>
}) {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    const { q, page, categories, brands, minPrice, maxPrice, inStock, archived } = await searchParams
    const currentPage = Number(page) || 1

    const filters: ProductFiltersType = {
        categories: categories ? categories.split(",") : undefined,
        brands: brands ? brands.split(",") : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock === "true",
        isArchived: archived === "true",
    }

    const [{ products, metadata }, distinctValues] = await Promise.all([
        getProductsPaginated(q, currentPage, 10, filters),
        getDistinctValues(),
    ])

    const role = session.user.role || "CLERK"
    const canManage_Products = role === "ADMIN" || role === "MANAGER"

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
                    {canManage_Products && (
                        <Link href="/products/import">
                            <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                <FileDown className="h-4 w-4" />
                                Import CSV
                            </Button>
                        </Link>
                    )}
                    {canManage_Products && (
                        <Link href="/products/new">
                            <Button className="gap-2 w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput />
                <ProductFilters categories={distinctValues.categories} brands={distinctValues.brands} />
            </div>

            <ProductListTable products={products} metadata={metadata} role={role} />
        </div>
    )
}
