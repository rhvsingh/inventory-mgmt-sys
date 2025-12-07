import { Plus } from "lucide-react"
import Link from "next/link"
import { getTransactions } from "@/actions/transaction"
import { Button } from "@/components/ui/button"
import { SaleList } from "./_components/sale-list"

export default async function SalesPage() {
    const sales = await getTransactions("SALE")

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
                <Link href="/sales/new">
                    <Button className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        New Sale
                    </Button>
                </Link>
            </div>

            <SaleList sales={sales} />
        </div>
    )
}
