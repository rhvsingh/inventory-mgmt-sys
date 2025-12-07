import { getInventoryValuation, getLowStockReport, getSalesHistory } from "@/actions/reports"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
    const session = await auth()
    const role = session?.user?.role

    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        redirect("/dashboard")
    }

    const [lowStockProducts, { params: valuation, products: allProducts }, salesHistory] = await Promise.all([
        getLowStockReport(),
        getInventoryValuation(),
        getSalesHistory(),
    ])

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Cost Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(valuation.totalCost)}</div>
                        <p className="text-xs text-muted-foreground">
                            Retail Value: {formatCurrency(valuation.totalRetail)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
                        <p className="text-xs text-muted-foreground">Variants below minimum</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items tracked</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valuation.itemCount}</div>
                        <p className="text-xs text-muted-foreground">Across {allProducts.length} SKUs</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="valuation" className="space-y-4">
                <TabsList>
                    <TabsTrigger className="cursor-pointer" value="valuation">
                        Valuation Report
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="low-stock">
                        Low Stock
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="sales">
                        Sales History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="valuation" className="space-y-4">
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
                                        {allProducts.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-4 font-mono">{p.sku}</td>
                                                <td className="p-4">{p.name}</td>
                                                <td className="p-4 text-right">{p.stockQty}</td>
                                                <td className="p-4 text-right">
                                                    {formatCurrency(Number(p.costPrice))}
                                                </td>
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
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                            <CardDescription>
                                Products that have fallen below their minimum stock level.
                            </CardDescription>
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
                                        {lowStockProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    Inventory levels are healthy. No notifications.
                                                </td>
                                            </tr>
                                        ) : (
                                            lowStockProducts.map((p) => (
                                                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-mono">{p.sku}</td>
                                                    <td className="p-4">{p.name}</td>
                                                    <td className="p-4 text-right font-bold text-destructive">
                                                        {p.stockQty}
                                                    </td>
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
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sales History</CardTitle>
                            <CardDescription>Overview of the last 50 sales transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="h-10 px-4 text-left font-medium">Date</th>
                                            <th className="h-10 px-4 text-left font-medium">Transaction ID</th>
                                            <th className="h-10 px-4 text-left font-medium">Items</th>
                                            <th className="h-10 px-4 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                    No sales recorded yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            salesHistory.map((t) => (
                                                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4">{formatDate(t.date)}</td>
                                                    <td className="p-4 font-mono text-xs text-muted-foreground">
                                                        {t.id.slice(-8)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            {t.items.map((item) => (
                                                                <span key={item.id} className="text-xs">
                                                                    {item.quantity}x {item.product.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right font-medium">
                                                        {formatCurrency(Number(t.total))}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
