import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { getLowStockReport } from "@/actions/reports"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function ProgressBar({ value, className }: { value: number; className?: string }) {
    let colorClass = "bg-emerald-500"
    if (value <= 20) {
        colorClass = "bg-destructive"
    } else if (value <= 60) {
        colorClass = "bg-amber-500"
    }

    return (
        <div className={cn("w-full bg-muted rounded-full h-2 overflow-hidden", className)}>
            <div className={cn("h-full transition-all duration-500", colorClass)} style={{ width: `${value}%` }} />
        </div>
    )
}

export async function LowStockCard({ permissions = [] }: { permissions?: string[] }) {
    const canSeeLowStock = permissions.includes("reports:low_stock")
    if (!canSeeLowStock) return null

    const lowStockItems = await getLowStockReport()

    // Sort so out-of-stock items are listed first, then lowest quantity ratio
    const sortedItems = [...lowStockItems]
        .sort((a, b) => {
            if (a.stockQty === 0 && b.stockQty > 0) return -1
            if (b.stockQty === 0 && a.stockQty > 0) return 1
            return a.stockQty / a.minStock - b.stockQty / b.minStock
        })
        .slice(0, 5) // Show top 5 urgent items

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-lg font-bold">Low Stock Alerts</CardTitle>
                    <CardDescription>Items requiring immediate attention</CardDescription>
                </div>
                {lowStockItems.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse px-2 py-0.5">
                        {lowStockItems.length} Urgent
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                {sortedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mb-3">
                            <span className="text-xl font-bold">✓</span>
                        </div>
                        <p className="font-semibold text-foreground">All stocks healthy</p>
                        <p className="text-xs text-muted-foreground mt-1">No items are below minimum stock limits</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {sortedItems.map((item) => {
                                const percentage =
                                    item.minStock > 0
                                        ? Math.min(Math.max(Math.round((item.stockQty / item.minStock) * 100), 0), 100)
                                        : 0
                                const isOutOfStock = item.stockQty <= 0

                                return (
                                    <div key={item.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-medium truncate max-w-[65%]">
                                                {item.name}
                                                <span className="text-xs font-mono text-muted-foreground ml-1.5">
                                                    ({item.sku})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "text-xs font-semibold",
                                                        isOutOfStock ? "text-destructive" : "text-amber-500",
                                                    )}
                                                >
                                                    {item.stockQty} / {item.minStock} left
                                                </span>
                                                {isOutOfStock ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] py-0 px-1 font-bold"
                                                    >
                                                        Out of Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50 text-[10px] py-0 px-1 font-bold"
                                                    >
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <ProgressBar
                                            value={percentage}
                                            className={cn("h-1.5", isOutOfStock ? "bg-muted" : "")}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        {lowStockItems.length > 5 && (
                            <Link
                                href="/reports?tab=low-stock"
                                className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline font-semibold mt-2 pt-2 border-t"
                            >
                                View all {lowStockItems.length} alerts
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
