import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ValuationProduct {
    id: string
    sku: string
    name: string
    stockQty: number
    costPrice: number
    salePrice: number
}

interface ValuationTableProps {
    products: ValuationProduct[]
}

export function ValuationTable({ products }: ValuationTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Valuation</CardTitle>
                <CardDescription>Detailed breakdown of current stock value per product.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="h-10 px-4 text-left font-medium">SKU</th>
                                <th className="h-10 px-4 text-left font-medium">Product</th>
                                <th className="h-10 px-4 text-right font-medium">Qty</th>
                                <th className="h-10 px-4 text-right font-medium">Cost</th>
                                <th className="h-10 px-4 text-right font-medium">Total Cost</th>
                                <th className="h-10 px-4 text-right font-medium">Retail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="p-4 font-mono">{p.sku}</td>
                                    <td className="p-4">{p.name}</td>
                                    <td className="p-4 text-right">{p.stockQty}</td>
                                    <td className="p-4 text-right">{formatCurrency(Number(p.costPrice))}</td>
                                    <td className="p-4 text-right font-medium">
                                        {formatCurrency(p.stockQty * Number(p.costPrice))}
                                    </td>
                                    <td className="p-4 text-right text-muted-foreground">
                                        {formatCurrency(Number(p.salePrice))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
