import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { CustomerForm } from "../../_components/customer-form"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
        where: { id },
    })

    if (!customer) notFound()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerForm initialData={customer} />
                </CardContent>
            </Card>
        </div>
    )
}
