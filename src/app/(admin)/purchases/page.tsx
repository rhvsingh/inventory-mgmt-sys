import { format } from "date-fns"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getTransactions } from "@/actions/transaction"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

import { auth } from "@/auth"

export default async function PurchasesPage() {
    const session = await auth()
    const role = session?.user?.role
    const canManage = role === "ADMIN" || role === "MANAGER"

    const purchases = await getTransactions("PURCHASE")

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
                {canManage && (
                    <Link href="/purchases/new">
                        <Button className="gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Record Purchase
                        </Button>
                    </Link>
                )}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No purchases recorded.
                                </TableCell>
                            </TableRow>
                        ) : (
                            purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{format(purchase.date, "MMM d, yyyy")}</TableCell>
                                    <TableCell className="font-mono text-xs">{purchase.id.slice(-8)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {purchase.items.map((item) => (
                                                <span key={item.id} className="text-sm text-muted-foreground">
                                                    {item.product?.name || "Unknown Product"} x {item.quantity} (
                                                    {formatCurrency(Number(item.product?.costPrice))} )
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(purchase.total))}
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
