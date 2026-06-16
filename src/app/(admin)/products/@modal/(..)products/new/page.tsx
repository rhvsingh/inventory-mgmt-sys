import type { Metadata } from "next"
import { createProduct } from "@/actions/product"
import { getAllSuppliers } from "@/actions/supplier"
import { auth } from "@/auth"
import { InterceptedDialog } from "@/components/intercepted-dialog"
import { ProductForm } from "@/components/product-form"

export const metadata: Metadata = {
    title: "New Product",
}

export default async function NewProductPage() {
    const session = await auth()
    if (!session || !session.user.permissions?.includes("products:create")) {
        return null
    }

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
