import { getSalesHistory } from "@/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/overview-chart"

export async function OverviewChartCard({ role }: { role?: string }) {
    const canSeeFinancials = role === "ADMIN" || role === "MANAGER"

    if (!canSeeFinancials) return null

    const salesHistory = await getSalesHistory()

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
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <OverviewChart data={chartData} />
            </CardContent>
        </Card>
    )
}
