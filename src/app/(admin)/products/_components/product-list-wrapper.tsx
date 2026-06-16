import {
	getProductsPaginated,
	type ProductFilters as ProductFiltersType,
} from "@/actions/product";
import { ProductList } from "./product-list";

interface ProductListWrapperProps {
	query?: string;
	page: number;
	filters: ProductFiltersType;
	permissions: string[];
}

export async function ProductListWrapper({
	query,
	page,
	filters,
	permissions,
}: ProductListWrapperProps) {
	const { products, metadata } = await getProductsPaginated(
		query,
		page,
		10,
		filters,
	);

	return (
		<ProductList
			products={products}
			metadata={metadata}
			permissions={permissions}
		/>
	);
}
