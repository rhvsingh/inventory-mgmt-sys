import { createProduct } from "@/actions/product"
import { InterceptedDialog } from "@/components/intercepted-dialog"
import { ProductForm } from "@/components/product-form"

export default function NewProductPage() {
    return (
        <InterceptedDialog title="Add New Product">
            <ProductForm
                action={createProduct}
                title="Add New Product"
                description="Enter the details for the new product."
                submitLabel="Create Product"
            />
        </InterceptedDialog>
    )
}
