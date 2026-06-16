"use client"

import { Archive, MoreHorizontal, Pencil, Trash2, Undo2 } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"
import { archiveProduct, deleteProduct, unarchiveProduct } from "@/actions/product"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductActionsProps {
    productId: string
    permissions?: string[]
    onDelete?: () => void
    isArchived?: boolean
}

export function ProductActions({ productId, permissions, onDelete, isArchived }: ProductActionsProps) {
    const [isPending, startTransition] = useTransition()
    const canEdit = permissions?.includes("products:update") ?? false
    const canArchive = permissions?.includes("products:archive") ?? false
    const canDelete = permissions?.includes("products:delete") ?? false
    const canManage = canEdit || canArchive || canDelete

    const handleArchive = () => {
        if (confirm("Are you sure you want to archive this product?")) {
            startTransition(async () => {
                const result = await archiveProduct(productId)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Product archived")
                    if (onDelete) onDelete()
                }
            })
        }
    }

    const handleRestore = () => {
        if (confirm("Are you sure you want to restore this product?")) {
            startTransition(async () => {
                const result = await unarchiveProduct(productId)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Product restored")
                    if (onDelete) onDelete()
                }
            })
        }
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) {
            startTransition(async () => {
                const result = await deleteProduct(productId)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Product deleted permanently")
                    if (onDelete) onDelete()
                }
            })
        }
    }

    if (!canManage) {
        return <div className="text-muted-foreground text-xs italic">Read-only</div>
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {canEdit && (
                    <>
                        <Link href={`/products/${productId}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        {(canArchive || canDelete) && <DropdownMenuSeparator />}
                    </>
                )}
                {isArchived ? (
                    <>
                        {canArchive && (
                            <DropdownMenuItem onClick={handleRestore} className="cursor-pointer" disabled={isPending}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Restore
                            </DropdownMenuItem>
                        )}
                        {canArchive && canDelete && <DropdownMenuSeparator />}
                        {canDelete && (
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:text-destructive cursor-pointer"
                                disabled={isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permanently
                            </DropdownMenuItem>
                        )}
                    </>
                ) : (
                    canArchive && (
                        <DropdownMenuItem
                            onClick={handleArchive}
                            className="text-destructive focus:text-destructive cursor-pointer"
                            disabled={isPending}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
