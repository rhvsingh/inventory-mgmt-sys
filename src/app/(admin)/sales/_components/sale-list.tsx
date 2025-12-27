"use client"

import { format } from "date-fns"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
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

import { Pagination } from "@/components/pagination"

export function SaleList({ sales, metadata }: SaleListProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")

    // Debounce search update
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            const currentSearch = params.get("search") || ""
            if (search !== currentSearch) {
                if (search) {
                    params.set("search", search)
                } else {
                    params.delete("search")
                }
                params.set("page", "1") // Reset page on search
                router.replace(`?${params.toString()}`)
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [search, router, searchParams])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sales..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No sales found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id}>
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
                                        <div className="flex flex-col gap-1">
                                            {sale.items.map((item) => (
                                                <span key={item.id} className="text-sm text-muted-foreground">
                                                    {item.product?.name || "Unknown Product"} x {item.quantity}{" "}
                                                    {item.quantity > 1 && `(${formatCurrency(Number(item.price))})`}
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
