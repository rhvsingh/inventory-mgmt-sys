"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LowStockReportItem } from "@/types"

interface LowStockTableProps {
    products: LowStockReportItem[]
}

export function LowStockTable({ products }: LowStockTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products that have fallen below their minimum stock level.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="h-10 px-4 text-left font-medium">SKU</th>
                                <th className="h-10 px-4 text-left font-medium">Product</th>
                                <th className="h-10 px-4 text-right font-medium">Current Stock</th>
                                <th className="h-10 px-4 text-right font-medium">Min Level</th>
                                <th className="h-10 px-4 text-right font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        Inventory levels are healthy. No notifications.
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4 font-mono">{p.sku}</td>
                                        <td className="p-4">{p.name}</td>
                                        <td className="p-4 text-right font-bold text-destructive">{p.stockQty}</td>
                                        <td className="p-4 text-right">{p.minStock}</td>
                                        <td className="p-4 text-right">
                                            <Badge variant="destructive">Low Stock</Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
