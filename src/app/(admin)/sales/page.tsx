import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllTransactionsForExport } from "@/actions/transaction";
import { auth } from "@/auth";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { SaleListWrapper } from "./_components/sale-list-wrapper";

export const metadata: Metadata = {
	title: "Sales",
};

interface SalesPageProps {
	searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("transactions:read")) {
		redirect("/dashboard");
	}
	const canManage = session.user.permissions.includes("transactions:create");

	const params = await searchParams;
	const page = Number(params.page) || 1;
	const search = params.search || "";

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Sales</h1>
				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
					<ExportButton
						filename="sales_export"
						fetchData={getAllTransactionsForExport.bind(null, "SALE")}
					/>
					{canManage && (
						<Link href="/sales/new" className="w-full sm:w-auto">
							<Button className="gap-2 w-full sm:w-auto cursor-pointer">
								<Plus className="h-4 w-4" />
								New Sale
							</Button>
						</Link>
					)}
				</div>
			</div>

			<Suspense
				key={`${page}-${search}`}
				fallback={<DataTableSkeleton columnCount={5} />}
			>
				<SaleListWrapper page={page} search={search} />
			</Suspense>
		</div>
	);
}
