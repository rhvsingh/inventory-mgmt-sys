import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSuppliers } from "@/actions/supplier"
import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Button } from "@/components/ui/button"
import { SupplierList } from "./_components/supplier-list"

export default async function SuppliersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const { page: pageStr, search: searchRaw } = await searchParams
    const session = await auth()
    if (!session?.user) redirect("/login")

    const page = Number(pageStr) || 1
    const search = searchRaw || ""

    const { data: suppliers } = await getSuppliers({ page, search })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
                <div className="flex gap-2">
                    <Link href="/suppliers/low-stock">
                        <Button variant="destructive">Low Stock Alerts</Button>
                    </Link>
                    <Link href="/suppliers/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Button>
                    </Link>
                </div>
            </div>

            <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                <SupplierList suppliers={suppliers} />
            </Suspense>
        </div>
    )
}
