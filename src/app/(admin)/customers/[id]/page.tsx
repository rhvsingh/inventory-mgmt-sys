import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getCustomer } from "@/actions/customer"
import { getTransactions } from "@/actions/transaction"
import { auth } from "@/auth"
import { SaleList } from "@/app/(admin)/sales/_components/sale-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function CustomerDetailsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const { id } = await params
    const { page: pageStr } = await searchParams
    const session = await auth()
    if (!session?.user) redirect("/login")

    const customer = await getCustomer(id)
    if (!customer) notFound()

    const page = Number(pageStr) || 1
    const { data: sales, metadata } = await getTransactions(
        "SALE",
        page,
        50,
        undefined, // search
        id // customerId
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/customers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Name</div>
                            <div className="text-lg font-semibold">{customer.name}</div>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Contact</div>
                            <div className="grid gap-1 mt-1">
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Email:</span>
                                        {customer.email}
                                    </div>
                                )}
                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Phone:</span>
                                        {customer.phone}
                                    </div>
                                )}
                                {!customer.email && !customer.phone && (
                                    <div className="text-sm text-muted-foreground italic">No contact info</div>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Address</div>
                            <div className="mt-1 text-sm whitespace-pre-wrap">
                                {customer.address || (
                                    <span className="text-muted-foreground italic">No address provided</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<div>Loading sales...</div>}>
                                <SaleList sales={sales} metadata={metadata} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
