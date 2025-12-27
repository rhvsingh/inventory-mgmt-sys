import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProduct, updateProduct } from "@/actions/product"
import { getAllSuppliers } from "@/actions/supplier"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [product, suppliers] = await Promise.all([getProduct(id), getAllSuppliers()])

    if (!product) {
        notFound()
    }

    const updateProductWithId = updateProduct.bind(null, product.id)

    return (
        <section className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
                <Link href="/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            </div>
            <ProductForm
                initialData={product}
                action={updateProductWithId}
                title="Edit Product"
                description="Update the product details."
                submitLabel="Save Changes"
                suppliers={suppliers}
            />
        </section>
    )
}
