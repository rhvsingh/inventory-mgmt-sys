import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ReportCardsSkeleton } from "./_components/skeletons"
import {
    LowStockTableWrapper,
    ReportCardsWrapper,
    SalesHistoryTableWrapper,
    ValuationTableWrapper,
} from "./_components/wrappers"

export default async function ReportsPage() {
    const session = await auth()
    const role = session?.user?.role

    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        redirect("/dashboard")
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>

            <Suspense fallback={<ReportCardsSkeleton />}>
                <ReportCardsWrapper />
            </Suspense>

            <Tabs defaultValue="valuation" className="space-y-4">
                <TabsList>
                    <TabsTrigger className="cursor-pointer" value="valuation">
                        Valuation Report
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="low-stock">
                        Low Stock
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="sales">
                        Sales History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="valuation" className="space-y-4">
                    <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                        <ValuationTableWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                    <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                        <LowStockTableWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <Suspense fallback={<DataTableSkeleton columnCount={4} />}>
                        <SalesHistoryTableWrapper />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
