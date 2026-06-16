"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductSelectProps {
    products: Product[]
    value: string
    onChange: (value: string) => void
}

export function ProductSelect({ products, value, onChange }: ProductSelectProps) {
    const [open, setOpen] = useState(false)

    const selectedProduct = products.find((product) => product.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex justify-between px-3 whitespace-normal min-h-9 h-auto text-left w-full"
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
            <PopoverContent className="w-75 p-0" align="start">
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
                                            value === product.id ? "opacity-100" : "opacity-0",
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
