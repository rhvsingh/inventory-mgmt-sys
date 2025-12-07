"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ProductFiltersProps {
    categories: string[]
    brands: string[]
}

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State for filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get("categories")?.split(",") || []
    )
    const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get("brands")?.split(",") || [])
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
    const [inStock, setInStock] = useState(searchParams.get("inStock") === "true")
    const [isArchived, setIsArchived] = useState(searchParams.get("archived") === "true")
    const [open, setOpen] = useState(false)

    // Sync with URL on open? No, just keep local state and sync on "Apply"
    // But we should init from URL

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams)

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        } else {
            params.delete("categories")
        }

        if (selectedBrands.length > 0) {
            params.set("brands", selectedBrands.join(","))
        } else {
            params.delete("brands")
        }

        if (minPrice) params.set("minPrice", minPrice)
        else params.delete("minPrice")

        if (maxPrice) params.set("maxPrice", maxPrice)
        else params.delete("maxPrice")

        if (inStock) params.set("inStock", "true")
        else params.delete("inStock")

        if (isArchived) params.set("archived", "true")
        else params.delete("archived")

        params.set("page", "1") // Reset page

        router.push(`?${params.toString()}`)
        setOpen(false)
    }

    const resetFilters = () => {
        setSelectedCategories([])
        setSelectedBrands([])
        setMinPrice("")
        setMaxPrice("")
        setInStock(false)
        setIsArchived(false)
    }

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const toggleBrand = (brand: string) => {
        setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>Narrow down your search results.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                        <h4 className="font-medium">Availability</h4>
                        <div className="flex items-center space-x-2">
                            {/* Fallback to checkbox if Switch missing, but I'll assume standard HTML checkbox for now if I can't find Switch */}
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="inStock">In Stock Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="archived"
                                checked={isArchived}
                                onChange={(e) => setIsArchived(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="archived">Show Archived</Label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Price Range</h4>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Category</h4>
                        <div className="grid gap-2">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`cat-${category}`}
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => toggleCategory(category)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor={`cat-${category}`}>{category}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Brand</h4>
                        <div className="grid gap-2">
                            {brands.map((brand) => (
                                <div key={brand} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`brand-${brand}`}
                                        checked={selectedBrands.includes(brand)}
                                        onChange={() => toggleBrand(brand)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <SheetFooter className="gap-2 sm:space-x-0">
                    <Button variant="outline" onClick={resetFilters}>
                        Reset
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
