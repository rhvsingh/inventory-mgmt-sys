import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCustomers } from "@/actions/customer"
import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { Button } from "@/components/ui/button"
import { CustomerList } from "./_components/customer-list"

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const { page: pageStr, search: searchRaw } = await searchParams
    const session = await auth()
    if (!session?.user) redirect("/login")

    const page = Number(pageStr) || 1
    const search = searchRaw || ""

    const { data: customers } = await getCustomers({ page, search })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <Link href="/customers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<DataTableSkeleton columnCount={5} />}>
                <CustomerList customers={customers} />
            </Suspense>
        </div>
    )
}
