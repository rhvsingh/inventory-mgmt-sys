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
import { PurchaseListWrapper } from "./_components/purchase-list-wrapper";

export const metadata: Metadata = {
	title: "Purchases",
};

interface PurchasesPageProps {
	searchParams: Promise<{ page?: string }>;
}

export default async function PurchasesPage({
	searchParams,
}: PurchasesPageProps) {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("transactions:read")) {
		redirect("/dashboard");
	}
	const canManage = session.user.permissions.includes("transactions:create");

	const params = await searchParams;
	const page = Number(params.page) || 1;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
					<ExportButton
						filename="purchases_export"
						fetchData={getAllTransactionsForExport.bind(null, "PURCHASE")}
					/>
					{canManage && (
						<>
							<Link href="/purchases/bulk" className="w-full sm:w-auto">
								<Button
									variant="outline"
									className="gap-2 w-full sm:w-auto cursor-pointer"
								>
									<Plus className="h-4 w-4" />
									Bulk Restock
								</Button>
							</Link>
							<Link href="/purchases/new" className="w-full sm:w-auto">
								<Button className="gap-2 w-full sm:w-auto cursor-pointer">
									<Plus className="h-4 w-4" />
									Record Purchase
								</Button>
							</Link>
						</>
					)}
				</div>
			</div>

			<Suspense key={page} fallback={<DataTableSkeleton columnCount={4} />}>
				<PurchaseListWrapper page={page} />
			</Suspense>
		</div>
	);
}
