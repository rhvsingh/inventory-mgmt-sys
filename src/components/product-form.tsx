"use client"

import { HelpCircle, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ActionState, Product } from "@/types"
import type { Supplier } from "@prisma/client"

interface ProductFormProps {
    initialData?: Product
    action: (prevState: ActionState | null, formData: FormData) => Promise<ActionState>
    title: string
    description: string
    submitLabel: string
    isModal?: boolean
    suppliers?: Supplier[]
}

export function ProductForm({
    initialData,
    action,
    title,
    description,
    submitLabel,
    isModal,
    suppliers = [],
}: ProductFormProps) {
    const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(action, null)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success && isModal) {
            router.back()
        }
    }, [state, isModal, router])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.[0]) {
            setSelectedFile(e.dataTransfer.files[0])
            // Sync with input
            if (inputRef.current) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(e.dataTransfer.files[0])
                inputRef.current.files = dataTransfer.files
            }
        }
    }

    const onButtonClick = () => {
        inputRef.current?.click()
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
        <TooltipProvider>
            <form action={formAction}>
                {isModal && <input type="hidden" name="skipRedirect" value="true" />}
                {state?.error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4">{state.error}</div>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Stock Keeping Unit - Unique identifier for the product.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="sku"
                                    name="sku"
                                    placeholder="PROD-001"
                                    defaultValue={initialData?.sku}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>ISBN, UPC, or EAN code for scanning.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="barcode"
                                    name="barcode"
                                    placeholder="Scan barcode"
                                    defaultValue={initialData?.barcode || ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>The full display name of the product.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Nike Air Zoom..."
                                    defaultValue={initialData?.name}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supplierId">Supplier</Label>
                                <Select name="supplierId" defaultValue={initialData?.supplierId || "none"}>
                                    <SelectTrigger className="w-full bg-background dark:bg-background">
                                        <SelectValue placeholder="Select a supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Brand or manufacturer name.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="brand"
                                    name="brand"
                                    placeholder="Nike"
                                    defaultValue={initialData?.brand || ""}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Product category for grouping (e.g., Shoes, Apparel).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="Shoes"
                                    defaultValue={initialData?.category || ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="costPrice">Cost Price</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>The price you paid for the item.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="costPrice"
                                    name="costPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    defaultValue={initialData?.costPrice}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="salePrice">Sale Price</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>The price you sell the item for.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="salePrice"
                                    name="salePrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    defaultValue={initialData?.salePrice}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="stockQty">Initial Stock</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Current quantity on hand.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="stockQty"
                                    name="stockQty"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={initialData?.stockQty}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="minStock">Reorder Point</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Minimum stock level before alert is triggered.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="minStock"
                                    name="minStock"
                                    type="number"
                                    placeholder="5"
                                    defaultValue={initialData?.minStock ?? 5}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Product Image</Label>
                            {selectedFile ? (
                                <section
                                    aria-label="File Upload Drop Zone"
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 transition-colors w-full",
                                        dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
                                        "bg-muted/50"
                                    )}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">{selectedFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={removeFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </section>
                            ) : (
                                <button
                                    type="button"
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 transition-colors w-full",
                                        dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
                                        "cursor-pointer hover:bg-muted/50"
                                    )}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={onButtonClick}
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <div className="text-center text-sm text-muted-foreground">
                                        <span className="font-medium text-primary">Click to upload</span> or drag and
                                        drop
                                        <br />
                                        PNG, JPG or WebP (max. 2MB)
                                    </div>
                                    {initialData?.imageUrl && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Current image: {initialData.imageUrl.split("/").pop()}
                                        </div>
                                    )}
                                </button>
                            )}
                            <Input
                                ref={inputRef}
                                type="file"
                                name="image"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                            alert("File is too large. Max size is 5MB.")
                                            e.target.value = "" // Reset
                                            return
                                        }
                                        setSelectedFile(file)
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        {/* <Link href="/products">
                            <Button variant="ghost" type="button">
                                Cancel
                            </Button>
                        </Link> */}
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : submitLabel}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </TooltipProvider>
    )
}
