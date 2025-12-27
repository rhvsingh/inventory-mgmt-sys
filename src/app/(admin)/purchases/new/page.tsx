"use client"

import { ArrowLeft, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { toast } from "sonner"
import { getProducts } from "@/actions/product"
import { getAllSuppliers } from "@/actions/supplier"
import { createTransaction } from "@/actions/transaction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

interface PurchaseItem {
    id: string
    productId: string
    quantity: number
    price: number
}

interface ProductSelectProps {
    products: Product[]
    value: string
    onChange: (value: string) => void
}

function ProductSelect({ products, value, onChange }: ProductSelectProps) {
    const [open, setOpen] = useState(false)

    const selectedProduct = products.find((product) => product.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex justify-between px-3 whitespace-normal min-h-9 h-auto text-left"
                >
                    <span className="w-auto">
                        {value
                            ? selectedProduct
                                ? `${selectedProduct.name} (${selectedProduct.sku})`
                                : "Product not found"
                            : "Select product..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search product..." />
                    <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.sku}`} // Search by name and SKU
                                    onSelect={() => {
                                        onChange(product.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{product.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            SKU: {product.sku} | Stock: {product.stockQty}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

function NewPurchaseContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
    // Initialize with one empty item containing a unique ID
    const [items, setItems] = useState<PurchaseItem[]>([{ id: "init-1", productId: "", quantity: 1, price: 0 }])
    const [loading, setLoading] = useState(false)
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")

    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const loadData = async () => {
            const [productsData, suppliersData] = await Promise.all([getProducts(), getAllSuppliers()])
            setProducts(productsData)
            setSuppliers(suppliersData)

            const urlProductId = searchParams.get("productId")
            const urlSupplierId = searchParams.get("supplierId")

            if (urlSupplierId) {
                setSelectedSupplierId(urlSupplierId)
            }

            if (urlProductId) {
                const product = productsData.find((p) => p.id === urlProductId)
                if (product) {
                    setItems([
                        {
                            id: crypto.randomUUID(),
                            productId: urlProductId,
                            quantity: 1, // Default to minStock or reorderQty logic if existed, 1 for now
                            price: Number(product.costPrice),
                        },
                    ])
                }
            }
        }
        loadData()
    }, [searchParams])

    const handleAddItem = () => {
        setItems([...items, { id: crypto.randomUUID(), productId: "", quantity: 1, price: 0 }])
    }

    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id))
    }

    const handleItemChange = (id: string, field: keyof Omit<PurchaseItem, "id">, value: string | number) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    const newItem = { ...item }
                    if (field === "productId") {
                        newItem.productId = value as string
                        // Auto-fill cost price
                        const product = products.find((p) => p.id === value)
                        if (product) {
                            newItem.price = Number(product.costPrice)
                        }
                    } else if (field === "quantity") {
                        newItem.quantity = Number(value)
                    } else if (field === "price") {
                        newItem.price = Number(value)
                    }
                    return newItem
                }
                return item
            })
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await createTransaction({
                type: "PURCHASE",
                supplierId: selectedSupplierId || undefined,
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: Number(i.quantity),
                    price: Number(i.price),
                })),
            })

            if (res?.error) {
                toast.error(res.error)
                setLoading(false)
            } else {
                toast.success("Purchase recorded!")
                router.push("/purchases")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to record purchase")
            setLoading(false)
        }
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
                    <CardContent className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label>Supplier (Optional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !selectedSupplierId && "text-muted-foreground"
                                            )}
                                        >
                                            {selectedSupplierId
                                                ? suppliers.find((s) => s.id === selectedSupplierId)?.name
                                                : "Select supplier"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search supplier..." />
                                            <CommandList>
                                                <CommandEmpty>No supplier found.</CommandEmpty>
                                                <CommandGroup>
                                                    {suppliers.map((supplier) => (
                                                        <CommandItem
                                                            value={supplier.name}
                                                            key={supplier.id}
                                                            onSelect={() => {
                                                                setSelectedSupplierId(
                                                                    supplier.id === selectedSupplierId
                                                                        ? ""
                                                                        : supplier.id
                                                                )
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    supplier.id === selectedSupplierId
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {supplier.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

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

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-4 sm:items-end border p-4 rounded-md bg-muted/20"
                                >
                                    <div className="w-full sm:flex-1 grid gap-2">
                                        <Label>Product</Label>
                                        <ProductSelect
                                            products={products}
                                            value={item.productId}
                                            onChange={(val) => handleItemChange(item.id, "productId", val)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:contents">
                                        <div className="w-full sm:w-24 grid gap-2">
                                            <Label>Qty</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
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
                                                onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(item.id)}
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

export default function NewPurchasePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewPurchaseContent />
        </Suspense>
    )
}
