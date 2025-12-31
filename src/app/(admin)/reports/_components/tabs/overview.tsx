import { getProfitLossReport, getTopSellingProducts } from "@/actions/reports"
import { ProfitLossCard } from "../profit-loss-card"
import { TopProductsTable } from "../top-products-table"

export async function OverviewWrapper() {
    const [profitLoss, topProducts] = await Promise.all([getProfitLossReport(), getTopSellingProducts()])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <ProfitLossCard data={profitLoss} />
            </div>
            <div className="col-span-3">
                <TopProductsTable data={topProducts} />
            </div>
        </div>
    )
}
