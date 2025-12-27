import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createProduct } from "@/actions/product"
import { getAllSuppliers } from "@/actions/supplier"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"

export default async function NewProductPage() {
    const suppliers = await getAllSuppliers()

    return (
        <section className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
                <Link href="/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            </div>
            <ProductForm
                action={createProduct}
                title="Add New Product"
                description="Enter the details for the new product."
                submitLabel="Create Product"
                suppliers={suppliers}
            />
        </section>
    )
}
