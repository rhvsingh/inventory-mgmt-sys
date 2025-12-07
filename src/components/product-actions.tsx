"use client"

import { Archive, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { archiveProduct } from "@/actions/product"
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
    role?: string
}

export function ProductActions({ productId, role }: ProductActionsProps) {
    const [isPending, startTransition] = useTransition()
    const canManage = role === "ADMIN" || role === "MANAGER"

    const handleArchive = () => {
        if (confirm("Are you sure you want to archive this product?")) {
            startTransition(async () => {
                await archiveProduct(productId)
            })
        }
    }

    // If can't manage, maybe we show nothing or just "View" (but View is default via row click maybe?)
    // For now, let's just return null if they can't manage, effectively hiding the actions menu
    // OR we could show "Sell" shortcut here later.
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
                <Link href={`/products/${productId}/edit`}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleArchive}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    disabled={isPending}
                >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
