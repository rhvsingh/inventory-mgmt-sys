import { getDistinctValues } from "@/actions/product"
import { ProductFilters } from "@/components/product-filters"

export async function FilterWrapper() {
    const { categories, brands } = await getDistinctValues()

    return <ProductFilters categories={categories} brands={brands} />
}
