"use client"

import { memo } from "react"
import Image from "next/image"
import { TableCell, TableRow } from "@/components/ui/table"
import { ProductActions } from "@/components/product-actions"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductListRowProps {
    product: Product
    visibleColumns: Set<string>
    role?: string
    onDelete: () => void
}

export const ProductListRow = memo(
    function ProductListRow({ product, visibleColumns, role, onDelete }: ProductListRowProps) {
        return (
            <TableRow>
                {visibleColumns.has("image") && (
                    <TableCell>
                        {product.imageUrl ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <span className="text-xs text-muted-foreground">Img</span>
                            </div>
                        )}
                    </TableCell>
                )}
                {visibleColumns.has("sku") && <TableCell className="font-medium">{product.sku}</TableCell>}
                {visibleColumns.has("name") && <TableCell>{product.name}</TableCell>}
                {visibleColumns.has("brand") && <TableCell>{product.brand || "-"}</TableCell>}
                {visibleColumns.has("category") && <TableCell>{product.category || "-"}</TableCell>}
                {visibleColumns.has("costPrice") && (
                    <TableCell className="text-right">{formatCurrency(Number(product.costPrice))}</TableCell>
                )}
                {visibleColumns.has("salePrice") && (
                    <TableCell className="text-right">{formatCurrency(Number(product.salePrice))}</TableCell>
                )}
                {visibleColumns.has("stockQty") && <TableCell className="text-right">{product.stockQty}</TableCell>}
                {visibleColumns.has("actions") && (
                    <TableCell className="text-right">
                        <ProductActions
                            productId={product.id}
                            role={role}
                            onDelete={onDelete}
                            isArchived={product.isArchived}
                        />
                    </TableCell>
                )}
            </TableRow>
        )
    },
    (prev, next) => {
        return (
            prev.role === next.role &&
            prev.visibleColumns === next.visibleColumns &&
            prev.product.id === next.product.id &&
            new Date(prev.product.updatedAt).getTime() === new Date(next.product.updatedAt).getTime()
        )
    }
)
