"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { useEffect, useState } from "react"

export function SearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(searchParams.get("q") ?? "")
    const debouncedValue = useDebounce(value, 500)

    useEffect(() => {
        const currentQ = searchParams.get("q") ?? ""

        // Only update URL if the search value has actually changed compared to the URL
        if (debouncedValue === currentQ) return

        const params = new URLSearchParams(searchParams?.toString())

        if (debouncedValue) {
            params.set("q", debouncedValue)
            params.set("page", "1") // Reset to page 1 on new search
        } else {
            params.delete("q")
            // Only reset page if we actually cleared an existing search
            if (currentQ) {
                params.delete("page")
            }
        }

        router.push(`?${params.toString()}`)
    }, [debouncedValue, router, searchParams])

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    )
}
