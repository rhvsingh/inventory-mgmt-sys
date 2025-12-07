"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { SalesHistoryItem } from "@/types"

interface SalesHistoryTableProps {
    transactions: SalesHistoryItem[]
}

export function SalesHistoryTable({ transactions }: SalesHistoryTableProps) {
    return (
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
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No sales recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
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
    )
}
