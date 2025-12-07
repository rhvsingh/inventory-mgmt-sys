"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Product, Transaction, TransactionItem } from "@/types"

interface SaleWithItems extends Transaction {
    items: (TransactionItem & { product?: Product })[]
}

interface SaleListProps {
    sales: SaleWithItems[]
}

export function SaleList({ sales }: SaleListProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No sales recorded.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>{format(new Date(sale.date), "MMM d, yyyy HH:mm")}</TableCell>
                                <TableCell className="font-mono text-xs">{sale.id.slice(-8)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {sale.items.map((item) => (
                                            <span key={item.id} className="text-sm text-muted-foreground">
                                                {item.product?.name || "Unknown Product"} x {item.quantity} ({" "}
                                                {formatCurrency(Number(item.product?.salePrice))})
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {formatCurrency(Number(sale.total))}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
