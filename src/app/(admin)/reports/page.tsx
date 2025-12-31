import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ReportTabs } from "./_components/client-tabs"
import { RefreshButton } from "./_components/refresh-button"
import { ReportCardsSkeleton } from "./_components/skeletons"
import { ReportCardsWrapper } from "./_components/wrappers"

export const metadata: Metadata = {
    title: "Reports",
}

interface ReportsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const session = await auth()
    const role = session?.user?.role

    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        redirect("/dashboard")
    }

    const resolvedParams = await searchParams
    const activeTab = (resolvedParams.tab as string) || "overview"

    let tabContent = null

    switch (activeTab) {
        case "overview": {
            const { OverviewWrapper } = await import("./_components/tabs/overview")
            tabContent = (
                <TabsContent value="overview" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <OverviewWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "sales": {
            const { SalesHistoryTableWrapper, SalesSummaryWrapper } = await import("./_components/tabs/sales")
            tabContent = (
                <TabsContent value="sales" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <SalesSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={4} />}>
                        <SalesHistoryTableWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "purchases": {
            const { PurchaseHistoryTableWrapper, PurchaseSummaryWrapper } = await import("./_components/tabs/purchases")
            tabContent = (
                <TabsContent value="purchases" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <PurchaseSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                        <PurchaseHistoryTableWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "suppliers": {
            const { SupplierStatsWrapper, SupplierSummaryWrapper } = await import("./_components/tabs/suppliers")
            tabContent = (
                <TabsContent value="suppliers" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <SupplierSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} />}>
                        <SupplierStatsWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "customers": {
            const { CustomerStatsWrapper, CustomerSummaryWrapper } = await import("./_components/tabs/customers")
            tabContent = (
                <TabsContent value="customers" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <CustomerSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={3} />}>
                        <CustomerStatsWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "valuation": {
            const { ValuationSummaryWrapper, ValuationTableWrapper } = await import("./_components/tabs/valuation")
            tabContent = (
                <TabsContent value="valuation" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <ValuationSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                        <ValuationTableWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        case "low-stock": {
            const { LowStockSummaryWrapper, LowStockTableWrapper } = await import("./_components/tabs/low-stock")
            tabContent = (
                <TabsContent value="low-stock" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <LowStockSummaryWrapper />
                    </Suspense>
                    <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                        <LowStockTableWrapper />
                    </Suspense>
                </TabsContent>
            )
            break
        }
        default: {
            // Fallback to overview or empty if invalid tab
            const { OverviewWrapper } = await import("./_components/tabs/overview")
            tabContent = (
                <TabsContent value="overview" className="space-y-4">
                    <Suspense fallback={<ReportCardsSkeleton />}>
                        <OverviewWrapper />
                    </Suspense>
                </TabsContent>
            )
        }
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

            <ReportTabs defaultValue="overview">
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

                {tabContent}
            </ReportTabs>
        </div>
    )
}
