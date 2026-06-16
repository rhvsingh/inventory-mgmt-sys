"use client"

import { format } from "date-fns"
import { Eye } from "lucide-react"
import { useState } from "react"
import { Pagination } from "@/components/pagination"
import { SearchInput } from "@/components/search-input"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Product, Transaction, TransactionItem } from "@/types"

interface SaleWithItems extends Transaction {
    items: (TransactionItem & { product?: Product })[]
}

interface SaleListProps {
    sales: SaleWithItems[]
    metadata: {
        total: number
        page: number
        totalPages: number
    }
}

export function SaleList({ sales, metadata }: SaleListProps) {
    const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <SearchInput placeholder="Search sales..." paramName="search" />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No sales found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow
                                    key={sale.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                        setSelectedSale(sale)
                                        setDetailsOpen(true)
                                    }}
                                >
                                    <TableCell>{format(new Date(sale.date), "MMM d, yyyy HH:mm")}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground" title={sale.id}>
                                        {sale.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {sale.customer ? (
                                            <span className="font-medium">{sale.customer.name}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">{sale.items.length} items</div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(Number(sale.total))}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
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

            <TransactionDetailsDialog transaction={selectedSale} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </div>
    )
}
