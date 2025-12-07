"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Product, Transaction, TransactionItem } from "@/types"

interface PurchaseWithItems extends Transaction {
    items: (TransactionItem & { product?: Product })[]
}

interface PurchaseListProps {
    purchases: PurchaseWithItems[]
}

export function PurchaseList({ purchases }: PurchaseListProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No purchases recorded.
                            </TableCell>
                        </TableRow>
                    ) : (
                        purchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                                <TableCell>{format(new Date(purchase.date), "MMM d, yyyy")}</TableCell>
                                <TableCell className="font-mono text-xs">{purchase.id.slice(-8)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {purchase.items.map((item) => (
                                            <span key={item.id} className="text-sm text-muted-foreground">
                                                {item.product?.name || "Unknown Product"} x {item.quantity} (
                                                {formatCurrency(Number(item.product?.costPrice))} )
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(Number(purchase.total))}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
