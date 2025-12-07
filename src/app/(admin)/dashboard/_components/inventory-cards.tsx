import { getInventoryValuation } from "@/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export async function InventoryCards({ role }: { role?: string }) {
    const canSeeFinancials = role === "ADMIN" || role === "MANAGER"

    if (!canSeeFinancials) return null

    const { params: valuation } = await getInventoryValuation()

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Inventory Cost</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(valuation.totalCost)}</div>
                    <p className="text-xs text-muted-foreground">Current asset value</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(valuation.totalRetail)}</div>
                    <p className="text-xs text-muted-foreground">{valuation.itemCount} Items in stock</p>
                </CardContent>
            </Card>
        </>
    )
}
