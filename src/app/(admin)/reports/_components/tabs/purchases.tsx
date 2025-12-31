import { format } from "date-fns"
import { getPurchaseHistory, getPurchaseSummary } from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import { type Column, ReportTable } from "../report-table"
import { SummaryStatsCard } from "../summary-stats-card"

export async function PurchaseSummaryWrapper() {
    const summary = await getPurchaseSummary()
    const stats = [
        { label: "Total Spend", value: formatCurrency(summary.totalSpend), icon: "currency" as const },
        { label: "Total Purchases", value: summary.count, icon: "cart" as const },
        { label: "Avg Purchase Value", value: formatCurrency(summary.avgValue), icon: "trending" as const },
    ]
    return <SummaryStatsCard stats={stats} />
}

export async function PurchaseHistoryTableWrapper() {
    const purchaseHistory = await getPurchaseHistory()

    const columns: Column<(typeof purchaseHistory)[0]>[] = [
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

    return <ReportTable data={purchaseHistory} columns={columns} />
}
