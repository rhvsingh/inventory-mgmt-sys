import { getLowStockReport } from "@/actions/reports"
import { LowStockTable } from "../low-stock-table"
import { SummaryStatsCard } from "../summary-stats-card"

export async function LowStockSummaryWrapper() {
    const products = await getLowStockReport()

    const outOfStockCount = products.filter((p) => p.stockQty <= 0).length

    const stats = [
        { label: "Low Stock Items", value: products.length, icon: "cart" as const },
        { label: "Out of Stock", value: outOfStockCount, icon: "trending" as const },
    ]

    return <SummaryStatsCard stats={stats} />
}

export async function LowStockTableWrapper() {
    const lowStockProducts = await getLowStockReport()
    return <LowStockTable products={lowStockProducts} />
}
