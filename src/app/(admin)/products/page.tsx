import { FileDown, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import type { ProductFilters as ProductFiltersType } from "@/actions/product"
import { auth } from "@/auth"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"

import { FilterWrapper } from "./_components/filter-wrapper"
import { ProductListWrapper } from "./_components/product-list-wrapper"
import { FilterSkeleton, ProductTableSkeleton } from "./_components/skeletons"

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
                <Suspense fallback={<FilterSkeleton />}>
                    <FilterWrapper />
                </Suspense>
            </div>

            <Suspense key={JSON.stringify({ q, currentPage, filters })} fallback={<ProductTableSkeleton />}>
                <ProductListWrapper query={q} page={currentPage} filters={filters} role={role} />
            </Suspense>
        </div>
    )
}
