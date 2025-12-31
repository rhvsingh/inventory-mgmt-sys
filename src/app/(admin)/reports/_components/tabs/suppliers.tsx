import { getSupplierStats, getSupplierSummary } from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import type { SupplierStats } from "@/types"
import { type Column, ReportTable } from "../report-table"
import { SummaryStatsCard } from "../summary-stats-card"

export async function SupplierSummaryWrapper() {
    const summary = await getSupplierSummary()
    const stats = [
        { label: "Total Suppliers", value: summary.totalCount, icon: "users" as const },
        {
            label: "Active Suppliers",
            value: summary.activeCount,
            subtext: "Suppliers we bought from",
            icon: "cart" as const,
        },
        {
            label: "Top Supplier",
            value: summary.topPerformerName,
            subtext: `Vol: ${formatCurrency(summary.topPerformerValue)}`,
            icon: "trending" as const,
        },
    ]
    return <SummaryStatsCard stats={stats} />
}

export async function SupplierStatsWrapper() {
    const stats = await getSupplierStats()

    const columns: Column<SupplierStats>[] = [
        { header: "Supplier", accessor: (s) => <span className="font-medium">{s.name}</span> },
        { header: "Transactions", accessor: (s) => s.transactionCount, className: "text-right" },
        { header: "Total Purchased", accessor: (s) => formatCurrency(s.totalPurchased), className: "text-right" },
    ]

    return <ReportTable title="Top Suppliers" data={stats} columns={columns} />
}
