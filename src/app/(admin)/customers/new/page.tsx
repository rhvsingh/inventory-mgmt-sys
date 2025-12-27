import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "../_components/customer-form"

export default function NewCustomerPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerForm />
                </CardContent>
            </Card>
        </div>
    )
}
