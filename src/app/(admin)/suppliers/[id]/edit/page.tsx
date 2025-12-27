import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { SupplierForm } from "../../_components/supplier-form"

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
        where: { id },
    })

    if (!supplier) notFound()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Supplier Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <SupplierForm initialData={supplier} />
                </CardContent>
            </Card>
        </div>
    )
}
