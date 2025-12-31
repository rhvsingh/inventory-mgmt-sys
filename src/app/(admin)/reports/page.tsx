import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { RefreshButton } from "./_components/refresh-button"
import { ReportCardsSkeleton } from "./_components/skeletons"
import {
    CustomerStatsWrapper,
    CustomerSummaryWrapper,
    LowStockSummaryWrapper,
    LowStockTableWrapper,
    OverviewWrapper,
    PurchaseHistoryTableWrapper,
    PurchaseSummaryWrapper,
    ReportCardsWrapper,
    SalesHistoryTableWrapper,
    SalesSummaryWrapper,
    SupplierStatsWrapper,
    SupplierSummaryWrapper,
    ValuationSummaryWrapper,
    ValuationTableWrapper,
} from "./_components/wrappers"

export const metadata: Metadata = {
    title: "Reports",
}

export default async function ReportsPage() {
    const session = await auth()
    const role = session?.user?.role

    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        redirect("/dashboard")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                <RefreshButton />
            </div>

            <Suspense fallback={<ReportCardsSkeleton />}>
                <ReportCardsWrapper />
            </Suspense>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger className="cursor-pointer" value="overview">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="sales">
                        Sales
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="purchases">
                        Purchases
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="suppliers">
                        Suppliers
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="customers">
                        Customers
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="valuation">
                        Valuation
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="low-stock">
                        Low Stock
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <OverviewWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <SalesSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={4} />}>
                        <SalesHistoryTableWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <PurchaseSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                        <PurchaseHistoryTableWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <SupplierSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} />}>
                        <SupplierStatsWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <CustomerSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} />}>
                        <CustomerStatsWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="valuation" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <ValuationSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                        <ValuationTableWrapper />
                    </Suspense>
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <LowStockSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                        <LowStockTableWrapper />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
