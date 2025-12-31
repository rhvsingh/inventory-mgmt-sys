import { format } from "date-fns"
import { getProfitLossReport, getSalesHistory } from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import { type Column, ReportTable } from "../report-table"
import { SummaryStatsCard } from "../summary-stats-card"

export async function SalesSummaryWrapper() {
    const summary = await getProfitLossReport()

    const stats = [
        { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), icon: "currency" as const },
        { label: "Gross Profit", value: formatCurrency(summary.grossProfit), icon: "trending" as const },
        { label: "Transactions", value: summary.transactionCount, icon: "cart" as const },
        {
            label: "Avg Transaction",
            value: formatCurrency(summary.transactionCount > 0 ? summary.totalRevenue / summary.transactionCount : 0),
            icon: "currency" as const,
        },
    ]

    return <SummaryStatsCard stats={stats} />
}

export async function SalesHistoryTableWrapper() {
    const salesHistory = await getSalesHistory()

    const columns: Column<(typeof salesHistory)[0]>[] = [
        { header: "Date", accessor: (t) => format(new Date(t.date), "MMM d, yyyy") },
        {
            header: "ID",
            accessor: (t) => <span className="font-mono text-xs text-muted-foreground">{t.id.slice(-8)}</span>,
        },
        { header: "User", accessor: (t) => t.user?.name || "-", className: "text-right text-muted-foreground" },
        {
            header: "Items",
            accessor: (t) => (
                <span
                    className="max-w-50 truncate block"
                    title={t.items.map((i) => `${i.quantity}x ${i.product?.name}`).join(", ")}
                >
                    {t.items.map((i) => `${i.quantity}x ${i.product?.name}`).join(", ")}
                </span>
            ),
        },
        { header: "Total", accessor: (t) => formatCurrency(t.total), className: "text-right font-medium" },
    ]

    return <ReportTable data={salesHistory} columns={columns} />
}
