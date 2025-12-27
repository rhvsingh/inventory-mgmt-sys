import { Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Button } from "@/components/ui/button"
import { SaleListWrapper } from "./_components/sale-list-wrapper"

interface SalesPageProps {
    searchParams: Promise<{ page?: string; search?: string }>
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const search = params.search || ""

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
                <Link href="/sales/new">
                    <Button className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        New Sale
                    </Button>
                </Link>
            </div>

            <Suspense key={`${page}-${search}`} fallback={<DataTableSkeleton columnCount={5} />}>
                <SaleListWrapper page={page} search={search} />
            </Suspense>
        </div>
    )
}
