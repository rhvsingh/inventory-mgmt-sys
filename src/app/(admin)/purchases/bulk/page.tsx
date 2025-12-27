import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSuppliers } from "@/actions/supplier"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { BulkPurchaseForm } from "./_components/bulk-purchase-form"

export default async function BulkPurchasePage() {
    const session = await auth()
    if (!session?.user) redirect("/login")
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
        return <div>Unauthorized</div>
    }

    const { data: suppliers } = await getSuppliers({ limit: 100 })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/purchases">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Purchase (Restock)</h1>
            </div>

            <BulkPurchaseForm suppliers={suppliers} />
        </div>
    )
}
