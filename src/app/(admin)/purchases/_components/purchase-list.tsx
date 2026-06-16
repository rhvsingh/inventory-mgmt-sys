"use client";

import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/pagination";
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Product, Transaction, TransactionItem } from "@/types";

interface PurchaseWithItems extends Transaction {
	items: (TransactionItem & { product?: Product })[];
}

interface PurchaseListProps {
	purchases: PurchaseWithItems[];
	metadata: {
		total: number;
		page: number;
		totalPages: number;
	};
}

export function PurchaseList({ purchases, metadata }: PurchaseListProps) {
	const [selectedPurchase, setSelectedPurchase] =
		useState<PurchaseWithItems | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);

	return (
		<div className="flex flex-col gap-4">
			<div className="rounded-md border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>ID</TableHead>
							<TableHead>Supplier</TableHead>
							<TableHead className="text-right">Items</TableHead>
							<TableHead className="text-right">Total Cost</TableHead>
							<TableHead className="w-12.5"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{purchases.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									No purchases recorded.
								</TableCell>
							</TableRow>
						) : (
							purchases.map((purchase) => (
								<TableRow
									key={purchase.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => {
										setSelectedPurchase(purchase);
										setDetailsOpen(true);
									}}
								>
									<TableCell>
										{format(new Date(purchase.date), "MMM d, yyyy")}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{purchase.id.slice(-8)}
									</TableCell>
									<TableCell>{purchase.supplier?.name || "-"}</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-col items-end gap-1">
											<span className="font-medium">
												{purchase.items.reduce(
													(acc, item) => acc + item.quantity,
													0,
												)}{" "}
												items
											</span>
											<span className="text-xs text-muted-foreground">
												{purchase.items.length} products
											</span>
										</div>
									</TableCell>
									<TableCell className="text-right font-medium">
										{formatCurrency(Number(purchase.total))}
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			{metadata.totalPages > 1 && (
				<Pagination
					totalPages={metadata.totalPages}
					currentPage={metadata.page}
					totalItems={metadata.total}
					pageSize={50}
				/>
			)}

			<TransactionDetailsDialog
				transaction={selectedPurchase}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
			/>
		</div>
	);
}
