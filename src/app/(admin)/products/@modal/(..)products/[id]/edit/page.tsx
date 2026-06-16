import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, updateProduct } from "@/actions/product";

import { getAllSuppliers } from "@/actions/supplier";
import { auth } from "@/auth";
import { InterceptedDialog } from "@/components/intercepted-dialog";
import { ProductForm } from "@/components/product-form";

export const metadata: Metadata = {
	title: "Edit Product",
};

export default async function EditProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("products:update")) {
		return null;
	}

	const { id } = await params;
	const product = await getProduct(id);
	const suppliers = await getAllSuppliers();

	if (!product) {
		notFound();
	}

	const updateAction = updateProduct.bind(null, id);

	return (
		<InterceptedDialog title="Edit Product">
			<ProductForm
				initialData={product}
				action={updateAction}
				title="Edit Product"
				description="Make changes to the product."
				submitLabel="Update Product"
				isModal
				suppliers={suppliers}
			/>
		</InterceptedDialog>
	);
}
