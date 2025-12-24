import { getInventoryValuation, getLowStockReport, getSalesHistory } from "@/actions/reports"
import { LowStockTable } from "./low-stock-table"
import { ReportCards } from "./report-cards"
import { SalesHistoryTable } from "./sales-history-table"
import { ValuationTable } from "./valuation-table"

export async function ReportCardsWrapper() {
    const [lowStockProducts, { params: valuation, products: allProducts }] = await Promise.all([
        getLowStockReport(),
        getInventoryValuation(),
    ])

    return <ReportCards valuation={valuation} lowStockCount={lowStockProducts.length} totalSkus={allProducts.length} />
}

export async function ValuationTableWrapper() {
    const { products: allProducts } = await getInventoryValuation()
    return <ValuationTable products={allProducts} />
}

export async function LowStockTableWrapper() {
    const lowStockProducts = await getLowStockReport()
    return <LowStockTable products={lowStockProducts} />
}

export async function SalesHistoryTableWrapper() {
    const salesHistory = await getSalesHistory()
    return <SalesHistoryTable transactions={salesHistory} />
}
