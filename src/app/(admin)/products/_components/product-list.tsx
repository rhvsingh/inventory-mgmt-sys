"use client"

import { useState, useCallback, useOptimistic } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import type { Product } from "@/types"
import { ProductListRow } from "./product-list-row"
import { productColumns } from "./product-columns"
import { ColumnToggle } from "./column-toggle"

interface ProductListProps {
    products: Product[]
    metadata: {
        page: number
        totalPages: number
        total: number
    }
    role?: string
}

export function ProductList({ products, metadata, role }: ProductListProps) {
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(productColumns.map((c) => c.id)))

    const [optimisticProducts, removeOptimisticProduct] = useOptimistic(products, (state, idToRemove: string) =>
        state.filter((p) => p.id !== idToRemove)
    )

    const toggleColumn = useCallback((column: string) => {
        setVisibleColumns((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(column)) {
                newSet.delete(column)
            } else {
                newSet.add(column)
            }
            return newSet
        })
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-2">
                <ColumnToggle visibleColumns={visibleColumns} onToggle={toggleColumn} />
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {productColumns.map((column) =>
                                visibleColumns.has(column.id) ? (
                                    <TableHead
                                        key={column.id}
                                        className={column.className || (column.align === "right" ? "text-right" : "")}
                                    >
                                        {column.label}
                                    </TableHead>
                                ) : null
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {optimisticProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={visibleColumns.size} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            optimisticProducts.map((product) => (
                                <ProductListRow
                                    key={product.id}
                                    product={product}
                                    visibleColumns={visibleColumns}
                                    role={role}
                                    onDelete={() => removeOptimisticProduct(product.id)}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
                {metadata.totalPages > 1 && (
                    <Pagination
                        totalPages={metadata.totalPages}
                        currentPage={metadata.page}
                        totalItems={metadata.total}
                        pageSize={10}
                    />
                )}
            </div>
        </div>
    )
}
