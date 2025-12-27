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
    metadata: {
        total: number
        page: number
        totalPages: number
    }
}

import { Pagination } from "@/components/pagination"

export function PurchaseList({ purchases, metadata }: PurchaseListProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Items</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No purchases recorded.
                                </TableCell>
                            </TableRow>
                        ) : (
                            purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{format(new Date(purchase.date), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="font-mono text-xs">{purchase.id.slice(-8)}</TableCell>
                                    <TableCell>{purchase.supplier?.name || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-medium">
                                                {purchase.items.reduce((acc, item) => acc + item.quantity, 0)} items
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {purchase.items.length} products
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(Number(purchase.total))}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {metadata.totalPages > 1 && (
                <Pagination
                    totalPages={metadata.totalPages}
                    currentPage={metadata.page}
                    totalItems={metadata.total}
                    pageSize={50}
                />
            )}
        </div>
    )
}
