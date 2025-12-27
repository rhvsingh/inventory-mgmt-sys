"use client"

import { ArrowLeft, IndianRupee, Percent, Plus, ScanBarcode, Trash, User, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { getCustomers } from "@/actions/customer"
import { getProducts } from "@/actions/product"
import { createTransaction } from "@/actions/transaction"
import { CustomerForm } from "@/app/(admin)/customers/_components/customer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types"

export default function NewSalePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [items, setItems] = useState<
        {
            productId: string
            quantity: number
            price: number
            name: string
            discount: number // The actual monetary value deducted
            discountInput: number // The user input value
            discountType: "amount" | "percentage"
        }[]
    >([])
    const [loading, setLoading] = useState(false)
    const [barcodeInput, setBarcodeInput] = useState("")
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    // Customer State
    const [customerOpen, setCustomerOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null)
    const [customerSearch, setCustomerSearch] = useState("")
    const [customerResults, setCustomerResults] = useState<{ id: string; name: string; phone?: string | null }[]>([])
    const [newCustomerOpen, setNewCustomerOpen] = useState(false)

    useEffect(() => {
        getProducts().then((data) => setProducts(data))
        barcodeInputRef.current?.focus()
    }, [])

    // Search customers (debounce)
    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await getCustomers({ search: customerSearch, limit: 5 })
            setCustomerResults(res.data)
        }
        const timeout = setTimeout(fetchCustomers, 300)
        return () => clearTimeout(timeout)
    }, [customerSearch])

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!barcodeInput) return

        const product = products.find(
            (p) => p.barcode === barcodeInput || p.sku.toLowerCase() === barcodeInput.toLowerCase()
        )

        if (product) {
            addItemToCart(product)
            setBarcodeInput("")
        } else {
            toast.error("Product not found!")
        }
    }

    const addItemToCart = (product: Product) => {
        const existingItemIndex = items.findIndex((i) => i.productId === product.id)

        if (existingItemIndex >= 0) {
            const newItems = [...items]
            newItems[existingItemIndex].quantity += 1
            // Recalculate discount if it's percentage
            if (newItems[existingItemIndex].discountType === "percentage") {
                const totalLinePrice = newItems[existingItemIndex].quantity * newItems[existingItemIndex].price
                newItems[existingItemIndex].discount =
                    totalLinePrice * (newItems[existingItemIndex].discountInput / 100)
            }
            setItems(newItems)
        } else {
            setItems([
                ...items,
                {
                    productId: product.id,
                    quantity: 1,
                    price: Number(product.salePrice),
                    name: product.name,
                    discount: 0,
                    discountInput: 0,
                    discountType: "amount",
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
        const item = newItems[index]
        item.quantity = qty

        // Recalculate discount
        if (item.discountType === "percentage") {
            const totalLinePrice = item.quantity * item.price
            item.discount = totalLinePrice * (item.discountInput / 100)
        }

        setItems(newItems)
    }

    const updateDiscount = (index: number, val: number, type?: "amount" | "percentage") => {
        if (val < 0) return
        const newItems = [...items]
        const item = newItems[index]

        item.discountInput = val
        if (type) item.discountType = type

        const totalLinePrice = item.quantity * item.price

        if (item.discountType === "percentage") {
            // Percentage of TOTAL line price (qty * price)
            item.discount = totalLinePrice * (item.discountInput / 100)
        } else {
            // Fixed amount deducted from the TOTAL line
            item.discount = item.discountInput
        }

        setItems(newItems)
    }

    const handleSubmit = async () => {
        if (items.length === 0) return
        setLoading(true)

        try {
            const res = await createTransaction({
                type: "SALE",
                customerId: selectedCustomer?.id,
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: Number(i.quantity),
                    price: Number(i.price),
                    discount: Number(i.discount),
                })),
            })

            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("Sale completed!")
                setItems([])
                setSelectedCustomer(null)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to complete sale")
        } finally {
            setLoading(false)
        }
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0)

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
                <div className="md:col-span-1 space-y-4">
                    {/* Customer Selection */}
                    <Card>
                        <CardHeader className="pb-3 pt-4 px-4">
                            <CardTitle className="text-sm font-medium">Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="flex w-full items-center gap-2">
                                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerOpen}
                                            className="flex-1 justify-between truncate"
                                        >
                                            {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                                            <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-75 p-0" align="start">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Search name or phone..."
                                                value={customerSearch}
                                                onValueChange={setCustomerSearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {customerResults.map((customer) => (
                                                        <CommandItem
                                                            key={customer.id}
                                                            value={customer.name}
                                                            onSelect={() => {
                                                                setSelectedCustomer({
                                                                    id: customer.id,
                                                                    name: customer.name,
                                                                })
                                                                setCustomerOpen(false)
                                                            }}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span>{customer.name}</span>
                                                                {customer.phone && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {customer.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="shrink-0">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer</DialogTitle>
                                        </DialogHeader>
                                        <CustomerForm
                                            onSuccess={(customer) => {
                                                setSelectedCustomer({ id: customer.id, name: customer.name })
                                                setNewCustomerOpen(false)
                                            }}
                                            onCancel={() => setNewCustomerOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {selectedCustomer && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-6 text-xs text-muted-foreground w-full justify-start px-0 hover:bg-transparent hover:underline"
                                    onClick={() => setSelectedCustomer(null)}
                                >
                                    Clear selected
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle>Current Sale</CardTitle>
                            <CardDescription>{items.length} items</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto py-4 space-y-4 min-h-50 max-h-100">
                            {items.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">Cart is empty</div>
                            ) : (
                                items.map((item, index) => (
                                    <div
                                        key={item.productId}
                                        className="flex flex-col gap-2 border-b pb-4 last:border-0"
                                    >
                                        <div className="flex justify-between items-start gap-2">
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
                                                    <span className="sr-only">Remove</span>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <Label className="text-xs text-muted-foreground w-12">Discount</Label>
                                            <div className="flex flex-1 items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="h-7 px-2 text-right text-xs"
                                                    placeholder="0"
                                                    min="0"
                                                    value={item.discountInput > 0 ? item.discountInput : ""}
                                                    onChange={(e) => updateDiscount(index, Number(e.target.value))}
                                                />
                                                <ToggleGroup
                                                    type="single"
                                                    value={item.discountType}
                                                    onValueChange={(val) => {
                                                        if (val)
                                                            updateDiscount(
                                                                index,
                                                                item.discountInput,
                                                                val as "amount" | "percentage"
                                                            )
                                                    }}
                                                    className="h-7 border rounded-md"
                                                >
                                                    <ToggleGroupItem
                                                        value="amount"
                                                        size="sm"
                                                        className="h-full px-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                                    >
                                                        <IndianRupee className="h-3 w-3" />
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="percentage"
                                                        size="sm"
                                                        className="h-full px-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                                    >
                                                        <Percent className="h-3 w-3" />
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            </div>
                                        </div>
                                        {item.discount > 0 && (
                                            <div className="text-right text-xs text-green-600">
                                                -{formatCurrency(item.discount)}
                                            </div>
                                        )}
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
