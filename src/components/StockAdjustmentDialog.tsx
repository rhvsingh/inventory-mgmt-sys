"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createAdjustment } from "@/actions/adjustment";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StockAdjustmentDialog({
	productId,
	productName,
	currentStock,
	onAdjust,
}: {
	productId: string;
	productName: string;
	currentStock: number;
	onAdjust?: (qtyChange: number) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
				>
					<SlidersHorizontal className="h-4 w-4" />
					<span className="sr-only">Adjust Stock</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-106">
				<form
					action={async (formData) => {
						const qtyChange = Number(formData.get("qtyChange"));
						if (onAdjust && !Number.isNaN(qtyChange)) {
							onAdjust(qtyChange);
						}
						setOpen(false);
						const result = await createAdjustment(formData);
						if (result && "error" in result && result.error) {
							toast.error(result.error);
						} else {
							toast.success("Stock adjusted successfully");
						}
					}}
				>
					<DialogHeader>
						<DialogTitle>Adjust Stock</DialogTitle>
						<DialogDescription>
							Make manual corrections to stock levels for {productName}.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<input type="hidden" name="productId" value={productId} />
						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right">Current</Label>
							<div className="col-span-3 font-mono">{currentStock}</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="qtyChange" className="text-right">
								Change
							</Label>
							<Input
								id="qtyChange"
								name="qtyChange"
								type="number"
								placeholder="-1 or 5"
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="reason" className="text-right">
								Reason
							</Label>
							<Input
								id="reason"
								name="reason"
								placeholder="Damaged, Found, Audit..."
								className="col-span-3"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" className="cursor-pointer">
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
