"use client";

import { Archive, MoreHorizontal, Pencil, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import {
	archiveProduct,
	deleteProduct,
	unarchiveProduct,
} from "@/actions/product";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductActionsProps {
	productId: string;
	permissions?: string[];
	onDelete?: () => void;
	isArchived?: boolean;
}

export function ProductActions({
	productId,
	permissions,
	onDelete,
	isArchived,
}: ProductActionsProps) {
	const [isPending, startTransition] = useTransition();
	const canEdit = permissions?.includes("products:update") ?? false;
	const canArchive = permissions?.includes("products:archive") ?? false;
	const canDelete = permissions?.includes("products:delete") ?? false;
	const canManage = canEdit || canArchive || canDelete;

	const handleArchive = () => {
		startTransition(async () => {
			const result = await archiveProduct(productId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Product archived");
				if (onDelete) onDelete();
			}
		});
	};

	const handleRestore = () => {
		startTransition(async () => {
			const result = await unarchiveProduct(productId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Product restored");
				if (onDelete) onDelete();
			}
		});
	};

	const handleDelete = () => {
		startTransition(async () => {
			const result = await deleteProduct(productId);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success("Product deleted permanently");
				if (onDelete) onDelete();
			}
		});
	};

	if (!canManage) {
		return (
			<div className="text-muted-foreground text-xs italic">Read-only</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				{canEdit && (
					<>
						<Link href={`/products/${productId}/edit`}>
							<DropdownMenuItem className="cursor-pointer">
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
						</Link>
						{(canArchive || canDelete) && <DropdownMenuSeparator />}
					</>
				)}
				{isArchived ? (
					<>
						{canArchive && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<DropdownMenuItem
										onSelect={(e) => e.preventDefault()}
										className="cursor-pointer"
										disabled={isPending}
									>
										<Undo2 className="mr-2 h-4 w-4" />
										Restore
									</DropdownMenuItem>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Restore Product?</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to restore this product back to the
											active catalog?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleRestore}>
											Restore
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
						{canArchive && canDelete && <DropdownMenuSeparator />}
						{canDelete && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<DropdownMenuItem
										onSelect={(e) => e.preventDefault()}
										className="text-destructive focus:text-destructive cursor-pointer"
										disabled={isPending}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Permanently
									</DropdownMenuItem>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete
											this product from the database.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDelete}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</>
				) : (
					canArchive && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<DropdownMenuItem
									onSelect={(e) => e.preventDefault()}
									className="text-destructive focus:text-destructive cursor-pointer"
									disabled={isPending}
								>
									<Archive className="mr-2 h-4 w-4" />
									Archive
								</DropdownMenuItem>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Archive Product?</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to archive this product? Archived
										products cannot be added to new transactions.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleArchive}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Archive
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
