"use client"

import type { Customer } from "@prisma/client"
import { MoreHorizontal, Pen, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { deleteCustomer } from "@/actions/customer"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CustomerListProps {
    customers: Customer[]
    metadata: {
        total: number
        pageCount: number
        currentPage: number
    }
}

export function CustomerList({ customers }: Omit<CustomerListProps, "metadata">) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            const res = await deleteCustomer(id)
            if ("error" in res) {
                toast.error(res.error)
            } else {
                toast.success("Customer deleted")
                router.refresh()
            }
        }
    }

    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            const currentSearch = params.get("search") || ""
            if (search !== currentSearch) {
                if (search) {
                    params.set("search", search)
                } else {
                    params.delete("search")
                }
                params.set("page", "1")
                router.replace(`?${params.toString()}`)
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [search, router, searchParams])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email || "-"}</TableCell>
                                    <TableCell>{customer.phone || "-"}</TableCell>
                                    <TableCell>{customer.address || "-"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/customers/${customer.id}`}>
                                                        <Search className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/customers/${customer.id}/edit`}>
                                                        <Pen className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
