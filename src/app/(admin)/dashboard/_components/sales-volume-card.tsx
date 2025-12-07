import { getSalesHistory } from "@/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function SalesVolumeCard() {
    const salesHistory = await getSalesHistory()

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Sales Volume</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{salesHistory.length}</div>
                <p className="text-xs text-muted-foreground">Transactions recorded</p>
            </CardContent>
        </Card>
    )
}
