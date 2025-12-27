import { createProduct } from "@/actions/product"
import { getAllSuppliers } from "@/actions/supplier"
import { InterceptedDialog } from "@/components/intercepted-dialog"
import { ProductForm } from "@/components/product-form"

export default async function NewProductPage() {
    const suppliers = await getAllSuppliers()

    return (
        <InterceptedDialog title="Add New Product">
            <ProductForm
                action={createProduct}
                title="Add New Product"
                description="Enter the details for the new product."
                submitLabel="Create Product"
                isModal
                suppliers={suppliers}
            />
        </InterceptedDialog>
    )
}
