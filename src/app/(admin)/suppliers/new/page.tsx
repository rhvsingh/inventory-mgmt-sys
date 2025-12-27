import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierForm } from "../_components/supplier-form"

export default function NewSupplierPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add Supplier</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Supplier Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <SupplierForm />
                </CardContent>
            </Card>
        </div>
    )
}
