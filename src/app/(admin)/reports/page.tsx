import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import {
    getCustomerStatsForExport,
    getLowStockReport,
    getPurchaseHistoryForExport,
    getSalesHistoryForExport,
    getSupplierStatsForExport,
    getValuationReportForExport,
} from "@/actions/reports"
import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { ExportButton } from "@/components/export-button"
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
    if (!session?.user) {
        redirect("/dashboard")
    }

    const permissions = session.user.permissions || []
    const hasLowStock = permissions.includes("reports:low_stock")
    const hasValuation = permissions.includes("reports:valuation")
    const hasHistory = permissions.includes("reports:history")

    const allowedTabs = [
        { value: "overview", label: "Overview", allowed: hasHistory },
        { value: "sales", label: "Sales", allowed: hasHistory },
        { value: "purchases", label: "Purchases", allowed: hasHistory },
        { value: "suppliers", label: "Suppliers", allowed: hasHistory },
        { value: "customers", label: "Customers", allowed: hasHistory },
        { value: "valuation", label: "Valuation", allowed: hasValuation },
        { value: "low-stock", label: "Low Stock", allowed: hasLowStock },
    ].filter((t) => t.allowed)

    if (allowedTabs.length === 0) {
        redirect("/dashboard")
    }

    const resolvedParams = await searchParams
    const activeTab = (resolvedParams.tab as string) || allowedTabs[0].value

    if (!allowedTabs.some((t) => t.value === activeTab)) {
        redirect(`/reports?tab=${allowedTabs[0].value}`)
    }

    let exportButton = null
    switch (activeTab) {
        case "low-stock":
            exportButton = (
                <ExportButton filename="low_stock_report" fetchData={getLowStockReport} label="Export Low Stock" />
            )
            break
        case "valuation":
            exportButton = (
                <ExportButton
                    filename="inventory_valuation_report"
                    fetchData={getValuationReportForExport}
                    label="Export Valuation"
                />
            )
            break
        case "sales":
            exportButton = (
                <ExportButton
                    filename="sales_history_report"
                    fetchData={getSalesHistoryForExport}
                    label="Export Sales History"
                />
            )
            break
        case "purchases":
            exportButton = (
                <ExportButton
                    filename="purchase_history_report"
                    fetchData={getPurchaseHistoryForExport}
                    label="Export Purchase History"
                />
            )
            break
        case "suppliers":
            exportButton = (
                <ExportButton
                    filename="supplier_stats_report"
                    fetchData={getSupplierStatsForExport}
                    label="Export Supplier Stats"
                />
            )
            break
        case "customers":
            exportButton = (
                <ExportButton
                    filename="customer_stats_report"
                    fetchData={getCustomerStatsForExport}
                    label="Export Customer Stats"
                />
            )
            break
    }

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
            // Fallback to first allowed tab
            redirect(`/reports?tab=${allowedTabs[0].value}`)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
                    {exportButton}
                    <RefreshButton />
                </div>
            </div>

            <Suspense fallback={<ReportCardsSkeleton />}>
                <ReportCardsWrapper />
            </Suspense>

            <ReportTabs defaultValue={allowedTabs[0].value}>
                <TabsList className="flex-wrap h-auto">
                    {allowedTabs.map((tab) => (
                        <TabsTrigger key={tab.value} className="cursor-pointer" value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {tabContent}
            </ReportTabs>
        </div>
    )
}
