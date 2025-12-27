"use client"

import Image from "next/image"
import type React from "react"
import { ProductActions } from "@/components/product-actions"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

export interface ColumnDef {
    id: string
    label: string
    align?: "left" | "right" | "center"
    className?: string
    render?: (product: Product, role?: string) => React.ReactNode
}

export const productColumns: ColumnDef[] = [
    {
        id: "image",
        label: "Image",
        className: "w-20",
        render: (product) =>
            product.imageUrl ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                </div>
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs text-muted-foreground">Img</span>
                </div>
            ),
    },
    {
        id: "sku",
        label: "SKU",
        render: (product) => <span className="font-medium">{product.sku}</span>,
    },
    {
        id: "name",
        label: "Name",
        render: (product) => product.name,
    },
    {
        id: "brand",
        label: "Brand",
        render: (product) => product.brand || "-",
    },
    {
        id: "category",
        label: "Category",
        render: (product) => product.category || "-",
    },
    {
        id: "supplier",
        label: "Supplier",
        render: (product) => product.supplier?.name || "-",
    },
    {
        id: "costPrice",
        label: "Cost Price",
        align: "right",
        render: (product) => formatCurrency(Number(product.costPrice)),
    },
    {
        id: "salePrice",
        label: "Sale Price",
        align: "right",
        render: (product) => formatCurrency(Number(product.salePrice)),
    },
    {
        id: "stockQty",
        label: "Stock",
        align: "right",
        render: (product) => product.stockQty,
    },
    {
        id: "actions",
        label: "Actions",
        align: "right",
        render: (product, role) => <ProductActions productId={product.id} role={role} />,
    },
]
