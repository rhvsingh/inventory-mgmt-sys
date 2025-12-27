"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createTransaction } from "@/actions/transaction"
import { getProducts } from "@/actions/product"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Product, Supplier } from "@/types"

interface BulkPurchaseFormProps {
    suppliers: Supplier[]
}

export function BulkPurchaseForm({ suppliers }: BulkPurchaseFormProps) {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
    const [products, setProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [costs, setCosts] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)

    const handleSupplierChange = async (supplierId: string) => {
        setSelectedSupplierId(supplierId)
        setLoadingProducts(true)
        setProducts([])
        setQuantities({})
        setCosts({})

        try {
            // Fetch products filtered by supplier from the server
            const supplierProducts = await getProducts({ supplierId })
            setProducts(supplierProducts)

            // Initialize costs
            const initialCosts: Record<string, number> = {}
            supplierProducts.forEach((p) => {
                initialCosts[p.id] = Number(p.costPrice)
            })
            setCosts(initialCosts)
        } catch (error) {
            toast.error("Failed to load products")
        } finally {
            setLoadingProducts(false)
        }
    }

    const handleQuantityChange = (productId: string, qty: number) => {
        if (qty < 0) return
        setQuantities((prev) => ({ ...prev, [productId]: qty }))
    }

    const handleCostChange = (productId: string, cost: number) => {
        if (cost < 0) return
        setCosts((prev) => ({ ...prev, [productId]: cost }))
    }

    const handleSubmit = async () => {
        const itemsToPurchase = products
            .filter((p) => (quantities[p.id] || 0) > 0)
            .map((p) => ({
                productId: p.id,
                quantity: quantities[p.id],
                price: costs[p.id], // Cost price for purchase
            }))

        if (itemsToPurchase.length === 0) {
            toast.error("Please select at least one item to purchase")
            return
        }

        setSubmitting(true)
        try {
            const res = await createTransaction({
                type: "PURCHASE",
                supplierId: selectedSupplierId,
                items: itemsToPurchase,
            })

            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("Bulk purchase recorded successfully")
                // Reset form
                setQuantities({})
                setSelectedSupplierId("")
                setProducts([])
            }
        } catch (error) {
            toast.error("Failed to process transaction")
        } finally {
            setSubmitting(false)
        }
    }

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0)
    const totalCost = products.reduce((sum, p) => {
        const qty = quantities[p.id] || 0
        const cost = costs[p.id] || 0
        return sum + qty * cost
    }, 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedSupplierId} onValueChange={handleSupplierChange}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select a supplier..." />
                        </SelectTrigger>
                        <SelectContent>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedSupplierId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingProducts ? (
                            <div>Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-muted-foreground">No products found for this supplier.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead className="w-[150px]">Restock Qty</TableHead>
                                                <TableHead className="w-[150px]">Unit Cost</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>{product.stockQty}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={quantities[product.id] || ""}
                                                            onChange={(e) =>
                                                                handleQuantityChange(product.id, Number(e.target.value))
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={costs[product.id]}
                                                            onChange={(e) =>
                                                                handleCostChange(product.id, Number(e.target.value))
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            (quantities[product.id] || 0) * (costs[product.id] || 0)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="text-sm text-muted-foreground">Total Items: {totalItems}</div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-lg font-bold">Total Cost: {formatCurrency(totalCost)}</div>
                                        <Button onClick={handleSubmit} disabled={totalItems === 0 || submitting}>
                                            {submitting ? "Processing..." : "Confirm Purchase"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
