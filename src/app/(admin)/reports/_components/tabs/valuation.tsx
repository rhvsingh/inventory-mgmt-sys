import { getInventoryValuation } from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import { SummaryStatsCard } from "../summary-stats-card"
import { ValuationTable } from "../valuation-table"

export async function ValuationSummaryWrapper() {
    const { params } = await getInventoryValuation()

    const stats = [
        { label: "Total Asset Cost", value: formatCurrency(params.totalCost), icon: "currency" as const },
        { label: "Total Retail Value", value: formatCurrency(params.totalRetail), icon: "trending" as const },
        { label: "Total Items", value: params.itemCount, icon: "cart" as const },
        {
            label: "Potential Margin",
            value: formatCurrency(params.totalRetail - params.totalCost),
            icon: "currency" as const,
        },
    ]

    return <SummaryStatsCard stats={stats} />
}

export async function ValuationTableWrapper() {
    const { products: allProducts } = await getInventoryValuation()
    return <ValuationTable products={allProducts} />
}
