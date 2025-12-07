import { getSalesHistory } from "@/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export async function RecentSalesCard() {
    const salesHistory = await getSalesHistory()

    return (
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
    )
}
