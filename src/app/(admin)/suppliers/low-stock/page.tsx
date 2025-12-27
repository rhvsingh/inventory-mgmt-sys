import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function LowStockPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const lowStockProducts = await prisma.product.findMany({
        where: {
            stockQty: {
                lte: prisma.product.fields.minStock,
            },
            isArchived: false,
        },
        include: {
            supplier: true,
        },
        orderBy: {
            stockQty: "asc",
        },
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Min Stock</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lowStockProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No low stock products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            lowStockProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-destructive font-bold">{product.stockQty}</TableCell>
                                    <TableCell>{product.minStock}</TableCell>
                                    <TableCell>
                                        {product.supplier ? (
                                            <Link
                                                href={`/suppliers/${product.supplier.id}/edit`}
                                                className="hover:underline"
                                            >
                                                {product.supplier.name}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">No Supplier</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/purchases/new?productId=${product.id}${
                                                product.supplierId ? `&supplierId=${product.supplierId}` : ""
                                            }`}
                                        >
                                            <Button variant="outline" size="sm">
                                                Restock
                                            </Button>
                                        </Link>
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
