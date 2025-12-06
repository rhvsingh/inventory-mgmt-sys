"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface PaginationProps {
    totalPages: number
    currentPage: number
    totalItems: number
    pageSize: number
}

export function Pagination({ totalPages, currentPage, totalItems, pageSize }: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams?.toString())
        params.set("page", pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    const onNext = () => {
        if (currentPage < totalPages) {
            router.push(createPageURL(currentPage + 1))
        }
    }

    const onPrevious = () => {
        if (currentPage > 1) {
            router.push(createPageURL(currentPage - 1))
        }
    }

    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex items-center justify-between border-t px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onPrevious} disabled={currentPage <= 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={onNext} disabled={currentPage >= totalPages}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
