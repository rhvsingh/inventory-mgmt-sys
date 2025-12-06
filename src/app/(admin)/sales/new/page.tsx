"use client"

import { ArrowLeft, ScanBarcode, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getProducts } from "@/app/actions/product"
import { createTransaction } from "@/app/actions/transaction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

import type { Product } from "@/types"

export default function NewSalePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [items, setItems] = useState<{ productId: string; quantity: number; price: number; name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [barcodeInput, setBarcodeInput] = useState("")
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        getProducts().then((data) => setProducts(data))
        // Auto-focus barcode input
        barcodeInputRef.current?.focus()
    }, [])

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!barcodeInput) return

        // Find product by barcode or SKU
        const product = products.find(
            (p) => p.barcode === barcodeInput || p.sku.toLowerCase() === barcodeInput.toLowerCase()
        )

        if (product) {
            addItemToCart(product)
            setBarcodeInput("")
        } else {
            alert("Product not found!")
        }
    }

    const addItemToCart = (product: Product) => {
        const existingItemIndex = items.findIndex((i) => i.productId === product.id)

        if (existingItemIndex >= 0) {
            const newItems = [...items]
            newItems[existingItemIndex].quantity += 1
            setItems(newItems)
        } else {
            setItems([
                ...items,
                {
                    productId: product.id,
                    quantity: 1,
                    price: Number(product.salePrice),
                    name: product.name,
                },
            ])
        }
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateQuantity = (index: number, qty: number) => {
        if (qty < 1) return
        const newItems = [...items]
        newItems[index].quantity = qty
        setItems(newItems)
    }

    const handleSubmit = async () => {
        if (items.length === 0) return
        setLoading(true)
        await createTransaction({
            type: "SALE",
            items: items.map((i) => ({
                productId: i.productId,
                quantity: Number(i.quantity),
                price: Number(i.price),
            })),
        })
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
                <Link href="/sales">
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">New Sale (POS)</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Scanner & Product List */}
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Add Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <ScanBarcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        ref={barcodeInputRef}
                                        placeholder="Scan barcode or enter SKU..."
                                        className="pl-8"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="cursor-pointer">
                                    Add
                                </Button>
                            </form>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {products.map((product) => (
                                    <Button
                                        key={product.id}
                                        variant="outline"
                                        className="h-auto py-3 flex flex-col items-start gap-1 cursor-pointer"
                                        onClick={() => addItemToCart(product)}
                                    >
                                        <span className="font-semibold truncate w-full text-left">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(Number(product.salePrice))}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Cart & Checkout */}
                <div className="md:col-span-1">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle>Current Sale</CardTitle>
                            <CardDescription>{items.length} items</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto py-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">Cart is empty</div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={item.productId} className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatCurrency(item.price)} x {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="number"
                                                className="h-8 w-14 px-1 text-center"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(index, Number(e.target.value))}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive cursor-pointer"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <CardFooter className="flex-col gap-4 border-t pt-6 bg-muted/20">
                            <div className="flex w-full justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full cursor-pointer"
                                disabled={items.length === 0 || loading}
                                onClick={handleSubmit}
                            >
                                {loading ? "Processing..." : "Complete Sale"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
