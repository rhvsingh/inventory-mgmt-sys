import { redirect } from "next/navigation"
import { getInventoryValuation, getSalesHistory } from "@/actions/reports"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

import { OverviewChart } from "@/components/overview-chart"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { role } = session.user
    const canSeeFinancials = role === "ADMIN" || role === "MANAGER"

    const [{ params: valuation }, salesHistory] = await Promise.all([getInventoryValuation(), getSalesHistory()])

    // Aggregate sales using Array.reduce properly (re-implementing chart logic correctly)
    const chartData = salesHistory
        .slice(0, 50)
        .reduce((acc, sale) => {
            const date = new Date(sale.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            const existing = acc.find((d) => d.name === date)
            if (existing) {
                existing.total += sale.total
            } else {
                acc.push({ name: date, total: sale.total })
            }
            return acc
        }, [] as { name: string; total: number }[])
        .reverse()

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className={`grid gap-4 md:grid-cols-${canSeeFinancials ? "3" : "1"}`}>
                {canSeeFinancials && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inventory Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(valuation.totalCost)}</div>
                            <p className="text-xs text-muted-foreground">Current asset value</p>
                        </CardContent>
                    </Card>
                )}
                {canSeeFinancials && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(valuation.totalRetail)}</div>
                            <p className="text-xs text-muted-foreground">{valuation.itemCount} Items in stock</p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Sales Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesHistory.length}</div>
                        <p className="text-xs text-muted-foreground">Transactions recorded</p>
                    </CardContent>
                </Card>
            </div>
            <div className={`grid gap-4 ${canSeeFinancials ? "md:grid-cols-2 lg:grid-cols-7" : "grid-cols-1"}`}>
                {canSeeFinancials && (
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <OverviewChart data={chartData} />
                        </CardContent>
                    </Card>
                )}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {salesHistory.slice(0, 5).map((sale) => (
                                <div key={sale.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {sale.items[0]?.product.name}
                                            {sale.items.length > 1 && ` +${sale.items.length - 1} others`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{sale.items.length} items</p>
                                    </div>
                                    <div className="ml-auto font-medium">{formatCurrency(sale.total)}</div>
                                </div>
                            ))}
                            {salesHistory.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">No recent sales</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
