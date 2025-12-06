"use client";

import { createProduct } from "@/app/actions/product";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
	return (
		<ProductForm
			action={createProduct}
			title="Add New Product"
			description="Enter the details for the new product."
			submitLabel="Create Product"
		/>
	);
}
