import { getCustomerStats, getCustomerSummary } from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import type { CustomerStats } from "@/types"
import { type Column, ReportTable } from "../report-table"
import { SummaryStatsCard } from "../summary-stats-card"

export async function CustomerSummaryWrapper() {
    const summary = await getCustomerSummary()
    const stats = [
        { label: "Total Customers", value: summary.totalCount, icon: "users" as const },
        {
            label: "Active Customers",
            value: summary.activeCount,
            subtext: "Customers who bought items",
            icon: "cart" as const,
        },
        {
            label: "Top Customer",
            value: summary.topPerformerName,
            subtext: `Vol: ${formatCurrency(summary.topPerformerValue)}`,
            icon: "trending" as const,
        },
    ]
    return <SummaryStatsCard stats={stats} />
}

export async function CustomerStatsWrapper() {
    const stats = await getCustomerStats()

    const columns: Column<CustomerStats>[] = [
        { header: "Customer", accessor: (c) => <span className="font-medium">{c.name}</span> },
        { header: "Visits", accessor: (c) => c.visitCount, className: "text-right" },
        { header: "Total Spent", accessor: (c) => formatCurrency(c.totalSpent), className: "text-right" },
    ]

    return <ReportTable title="Top Customers" data={stats} columns={columns} />
}
