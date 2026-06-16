"use client";

import { format } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type {
	Customer,
	Product,
	Supplier,
	Transaction,
	TransactionItem,
} from "@/types";

interface TransactionWithDetails extends Transaction {
	items: (TransactionItem & { product?: Product })[];
	customer?: Customer | null;
	supplier?: Supplier | null;
}

interface TransactionDetailsDialogProps {
	transaction: TransactionWithDetails | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
	transaction,
	open,
	onOpenChange,
}: TransactionDetailsDialogProps) {
	if (!transaction) return null;

	const isSale = transaction.type === "SALE";

	const subtotal = transaction.items.reduce(
		(acc, item) => acc + Number(item.price) * item.quantity,
		0,
	);
	const totalDiscount = transaction.items.reduce(
		(acc, item) => acc + Number(item.discount || 0),
		0,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Transaction Details</DialogTitle>
					<DialogDescription>
						{isSale ? "Sale" : "Purchase"} ID:{" "}
						<span className="font-mono">{transaction.id}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-4 py-4">
					<div>
						<h4 className="text-sm font-medium text-muted-foreground mb-1">
							Date
						</h4>
						<p>{format(new Date(transaction.date), "PPP p")}</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-muted-foreground mb-1">
							{isSale ? "Customer" : "Supplier"}
						</h4>
						<p className="font-medium">
							{isSale
								? transaction.customer?.name || "Guest / Walk-in"
								: transaction.supplier?.name || "Unknown Supplier"}
						</p>
						{(transaction.customer?.phone || transaction.supplier?.phone) && (
							<p className="text-sm text-muted-foreground">
								{isSale
									? transaction.customer?.phone
									: transaction.supplier?.phone}
							</p>
						)}
					</div>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead className="text-right">Price</TableHead>
								<TableHead className="text-right">Qty</TableHead>
								<TableHead className="text-right">Discount</TableHead>
								<TableHead className="text-right">Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{transaction.items.map((item) => (
								<TableRow key={item.id}>
									<TableCell>
										<div className="font-medium">
											{item.product?.name || "Unknown Product"}
										</div>
										{item.product?.sku && (
											<div className="text-xs text-muted-foreground">
												SKU: {item.product.sku}
											</div>
										)}
									</TableCell>
									<TableCell className="text-right">
										{formatCurrency(Number(item.price))}
									</TableCell>
									<TableCell className="text-right">{item.quantity}</TableCell>
									<TableCell className="text-right text-red-500">
										{Number(item.discount) > 0
											? `-${formatCurrency(Number(item.discount))}`
											: "-"}
									</TableCell>
									<TableCell className="text-right font-medium">
										{formatCurrency(
											Number(item.price) * item.quantity -
												Number(item.discount),
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div className="flex flex-col gap-2 items-end pt-4">
					<div className="flex justify-between w-full max-w-50 text-sm">
						<span className="text-muted-foreground">Subtotal:</span>
						<span>{formatCurrency(subtotal)}</span>
					</div>

					{totalDiscount > 0 && (
						<div className="flex justify-between w-full max-w-50 text-sm text-red-500">
							<span>Discount:</span>
							<span>-{formatCurrency(totalDiscount)}</span>
						</div>
					)}

					<div className="flex justify-between w-full max-w-50 text-lg font-bold border-t pt-2 mt-2">
						<span>Total:</span>
						<span>{formatCurrency(Number(transaction.total))}</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
