"use client"

import { AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ReportCardsProps {
    valuation: {
        totalCost: number
        totalRetail: number
        itemCount: number
    }
    lowStockCount: number
    totalSkus: number
}

export function ReportCards({ valuation, lowStockCount, totalSkus }: ReportCardsProps) {
    return (
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
                    <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
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
                    <p className="text-xs text-muted-foreground">Across {totalSkus} SKUs</p>
                </CardContent>
            </Card>
        </div>
    )
}
