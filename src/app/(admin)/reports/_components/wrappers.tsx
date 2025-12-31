import { format } from "date-fns"
import {
    getCustomerStats,
    getCustomerSummary,
    getInventoryValuation,
    getLowStockReport,
    getProfitLossReport,
    getPurchaseHistory,
    getPurchaseSummary,
    getSalesHistory,
    getSupplierStats,
    getSupplierSummary,
    getTopSellingProducts,
} from "@/actions/reports"
import { formatCurrency } from "@/lib/utils"
import type { CustomerStats, SupplierStats } from "@/types"
import { LowStockTable } from "./low-stock-table"
import { ProfitLossCard } from "./profit-loss-card"
import { ReportCards } from "./report-cards"
import { type Column, ReportTable } from "./report-table"
import { SummaryStatsCard } from "./summary-stats-card"
import { TopProductsTable } from "./top-products-table"
import { ValuationTable } from "./valuation-table"

export async function CustomerStatsWrapper() {
    const stats = await getCustomerStats()

    const columns: Column<CustomerStats>[] = [
        { header: "Customer", accessor: (c) => <span className="font-medium">{c.name}</span> },
        { header: "Visits", accessor: (c) => c.visitCount, className: "text-right" },
        { header: "Total Spent", accessor: (c) => formatCurrency(c.totalSpent), className: "text-right" },
    ]

    return <ReportTable title="Top Customers" data={stats} columns={columns} />
}

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

export async function LowStockTableWrapper() {
    const lowStockProducts = await getLowStockReport()
    return <LowStockTable products={lowStockProducts} />
}

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

export async function PurchaseSummaryWrapper() {
    const summary = await getPurchaseSummary()
    const stats = [
        { label: "Total Spend", value: formatCurrency(summary.totalSpend), icon: "currency" as const },
        { label: "Total Purchases", value: summary.count, icon: "cart" as const },
        { label: "Avg Purchase Value", value: formatCurrency(summary.avgValue), icon: "trending" as const },
    ]
    return <SummaryStatsCard stats={stats} />
}

export async function ReportCardsWrapper() {
    const [lowStockProducts, { params: valuation, products: allProducts }] = await Promise.all([
        getLowStockReport(),
        getInventoryValuation(),
    ])

    return <ReportCards valuation={valuation} lowStockCount={lowStockProducts.length} totalSkus={allProducts.length} />
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

export async function SupplierStatsWrapper() {
    const stats = await getSupplierStats()

    const columns: Column<SupplierStats>[] = [
        { header: "Supplier", accessor: (s) => <span className="font-medium">{s.name}</span> },
        { header: "Transactions", accessor: (s) => s.transactionCount, className: "text-right" },
        { header: "Total Purchased", accessor: (s) => formatCurrency(s.totalPurchased), className: "text-right" },
    ]

    return <ReportTable title="Top Suppliers" data={stats} columns={columns} />
}

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

export async function ValuationTableWrapper() {
    const { products: allProducts } = await getInventoryValuation()
    return <ValuationTable products={allProducts} />
}

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

export async function LowStockSummaryWrapper() {
    const products = await getLowStockReport()

    const outOfStockCount = products.filter((p) => p.stockQty <= 0).length

    const stats = [
        { label: "Low Stock Items", value: products.length, icon: "cart" as const },
        { label: "Out of Stock", value: outOfStockCount, icon: "trending" as const },
    ]

    return <SummaryStatsCard stats={stats} />
}
