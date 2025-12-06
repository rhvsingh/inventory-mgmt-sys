"use client"

import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProducts } from "@/app/actions/product"
import { createTransaction } from "@/app/actions/transaction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

interface PurchaseItem {
    productId: string
    quantity: number
    price: number
}

export default function NewPurchasePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [items, setItems] = useState<PurchaseItem[]>([{ productId: "", quantity: 1, price: 0 }])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getProducts().then((data) => setProducts(data))
    }, [])

    const handleAddItem = () => {
        setItems([...items, { productId: "", quantity: 1, price: 0 }])
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
        const newItems = [...items]
        const item = { ...newItems[index] }

        if (field === "productId") {
            item.productId = value as string
            // Auto-fill cost price
            const product = products.find((p) => p.id === value)
            if (product) {
                item.price = Number(product.costPrice)
            }
        } else if (field === "quantity") {
            item.quantity = Number(value)
        } else if (field === "price") {
            item.price = Number(value)
        }

        newItems[index] = item
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await createTransaction({
            type: "PURCHASE",
            items: items.map((i) => ({
                productId: i.productId,
                quantity: Number(i.quantity),
                price: Number(i.price),
            })),
        })
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
                <Link href="/purchases">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Record Purchase</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Details</CardTitle>
                        <CardDescription>Record incoming stock from suppliers.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Items</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddItem}
                                    className="cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row gap-4 sm:items-end border p-4 rounded-md bg-muted/20"
                                >
                                    <div className="w-full sm:flex-1 grid gap-2">
                                        <Label>Product</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.sku})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:contents">
                                        <div className="w-full sm:w-24 grid gap-2">
                                            <Label>Qty</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full sm:w-32 grid gap-2">
                                            <Label>Cost (Unit)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-destructive cursor-pointer self-end"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end items-center gap-2 text-lg font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Link href="/purchases">
                            <Button variant="ghost" type="button" className="cursor-pointer">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="cursor-pointer">
                            {loading ? "Recording..." : "Record Purchase"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
