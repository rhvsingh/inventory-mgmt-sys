"use client"

import { useState } from "react"
import Image from "next/image"
import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductActions } from "@/components/product-actions"
import { Pagination } from "@/components/pagination"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductListTableProps {
    products: Product[]
    metadata: {
        page: number
        totalPages: number
        total: number
    }
    role?: string
}

export function ProductListTable({ products, metadata, role }: ProductListTableProps) {
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(["image", "sku", "name", "brand", "category", "costPrice", "salePrice", "stockQty", "actions"])
    )
    // ...
    // ...

    const toggleColumn = (column: string) => {
        const newSet = new Set(visibleColumns)
        if (newSet.has(column)) {
            newSet.delete(column)
        } else {
            newSet.add(column)
        }
        setVisibleColumns(newSet)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 h-8">
                            <Settings2 className="h-4 w-4" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("image")}
                            onCheckedChange={() => toggleColumn("image")}
                        >
                            Image
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("sku")}
                            onCheckedChange={() => toggleColumn("sku")}
                        >
                            SKU
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("name")}
                            onCheckedChange={() => toggleColumn("name")}
                        >
                            Name
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("brand")}
                            onCheckedChange={() => toggleColumn("brand")}
                        >
                            Brand
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("category")}
                            onCheckedChange={() => toggleColumn("category")}
                        >
                            Category
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("costPrice")}
                            onCheckedChange={() => toggleColumn("costPrice")}
                        >
                            Cost Price
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("salePrice")}
                            onCheckedChange={() => toggleColumn("salePrice")}
                        >
                            Sale Price
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("stockQty")}
                            onCheckedChange={() => toggleColumn("stockQty")}
                        >
                            Stock
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={visibleColumns.has("actions")}
                            onCheckedChange={() => toggleColumn("actions")}
                        >
                            Actions
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {visibleColumns.has("image") && <TableHead className="w-20">Image</TableHead>}
                            {visibleColumns.has("sku") && <TableHead>SKU</TableHead>}
                            {visibleColumns.has("name") && <TableHead>Name</TableHead>}
                            {visibleColumns.has("brand") && <TableHead>Brand</TableHead>}
                            {visibleColumns.has("category") && <TableHead>Category</TableHead>}
                            {visibleColumns.has("costPrice") && (
                                <TableHead className="text-right">Cost Price</TableHead>
                            )}
                            {visibleColumns.has("salePrice") && (
                                <TableHead className="text-right">Sale Price</TableHead>
                            )}
                            {visibleColumns.has("stockQty") && <TableHead className="text-right">Stock</TableHead>}
                            {visibleColumns.has("actions") && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={visibleColumns.size} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
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
                                    {visibleColumns.has("sku") && (
                                        <TableCell className="font-medium">{product.sku}</TableCell>
                                    )}
                                    {visibleColumns.has("name") && <TableCell>{product.name}</TableCell>}
                                    {visibleColumns.has("brand") && <TableCell>{product.brand || "-"}</TableCell>}
                                    {visibleColumns.has("category") && <TableCell>{product.category || "-"}</TableCell>}
                                    {visibleColumns.has("costPrice") && (
                                        <TableCell className="text-right">
                                            {formatCurrency(Number(product.costPrice))}
                                        </TableCell>
                                    )}
                                    {visibleColumns.has("salePrice") && (
                                        <TableCell className="text-right">
                                            {formatCurrency(Number(product.salePrice))}
                                        </TableCell>
                                    )}
                                    {visibleColumns.has("stockQty") && (
                                        <TableCell className="text-right">{product.stockQty}</TableCell>
                                    )}
                                    {visibleColumns.has("actions") && (
                                        <TableCell className="text-right">
                                            <ProductActions productId={product.id} role={role} />
                                        </TableCell>
                                    )}
                                </TableRow>
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
