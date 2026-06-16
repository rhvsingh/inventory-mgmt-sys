"use client";

import { format } from "date-fns";
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	Eye,
	Info,
	Search,
	User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { AuditLog } from "@/actions/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface AuditLogListProps {
	logs: AuditLog[];
	metadata: {
		total: number;
		pageCount: number;
		currentPage: number;
	};
	search: string;
	action: string;
}

const actionOptions = [
	{ value: "", label: "All Actions" },
	{ value: "PRODUCT_CREATE", label: "Product Create" },
	{ value: "PRODUCT_UPDATE", label: "Product Update" },
	{ value: "PRODUCT_DELETE", label: "Product Delete" },
	{ value: "TRANSACTION_CREATE", label: "Transaction Create" },
	{ value: "ADJUSTMENT_CREATE", label: "Adjustment Create" },
	{ value: "USER_CREATE", label: "User Create" },
	{ value: "USER_UPDATE", label: "User Update" },
	{ value: "USER_DELETE", label: "User Delete" },
	{ value: "ROLE_CREATE", label: "Role Create" },
	{ value: "ROLE_UPDATE", label: "Role Update" },
	{ value: "ROLE_DELETE", label: "Role Delete" },
	{ value: "PROFILE_UPDATE", label: "Profile Update" },
];

export function AuditLogList({
	logs,
	metadata,
	search,
	action,
}: AuditLogListProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchValue, setSearchValue] = useState(search);
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

	// Handle filter submission
	const applyFilters = (newSearch: string, newAction: string) => {
		const params = new URLSearchParams(searchParams?.toString());
		params.set("page", "1"); // Reset to page 1 on search change

		if (newSearch) {
			params.set("q", newSearch);
		} else {
			params.delete("q");
		}

		if (newAction) {
			params.set("action", newAction);
		} else {
			params.delete("action");
		}

		router.push(`?${params.toString()}`);
	};

	// Handle pagination
	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams?.toString());
		params.set("page", page.toString());
		router.push(`?${params.toString()}`);
	};

	const getActionBadgeVariant = (action: string) => {
		if (action.startsWith("PRODUCT_")) return "outline"; // blue outline custom logic
		if (action.startsWith("TRANSACTION_")) return "default"; // green solid
		if (action.startsWith("ADJUSTMENT_")) return "secondary"; // orange
		if (action.startsWith("USER_")) return "destructive"; // red/purple
		return "secondary";
	};

	const getActionBadgeColorClass = (action: string) => {
		if (action.startsWith("PRODUCT_"))
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200";
		if (action.startsWith("TRANSACTION_"))
			return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200";
		if (action.startsWith("ADJUSTMENT_"))
			return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200";
		if (action.startsWith("USER_"))
			return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200";
		if (action.startsWith("ROLE_"))
			return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200";
		return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200";
	};

	const formatDetails = (detailsStr: string) => {
		try {
			const parsed = JSON.parse(detailsStr);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return detailsStr;
		}
	};

	return (
		<div className="space-y-4">
			{/* Filter Bar */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search logs details or user..."
						className="pl-8"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								applyFilters(searchValue, action);
							}
						}}
					/>
				</div>

				<select
					className="flex h-9 w-full sm:w-50 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					value={action}
					onChange={(e) => applyFilters(searchValue, e.target.value)}
				>
					{actionOptions.map((opt) => (
						<option
							key={opt.value}
							value={opt.value}
							className="bg-background text-foreground"
						>
							{opt.label}
						</option>
					))}
				</select>

				<Button
					variant="outline"
					size="sm"
					onClick={() => applyFilters(searchValue, action)}
				>
					Search
				</Button>

				{(search || action) && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSearchValue("");
							applyFilters("", "");
						}}
					>
						Reset Filters
					</Button>
				)}
			</div>

			{/* Logs Table */}
			<div className="rounded-md border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-45">Timestamp</TableHead>
							<TableHead className="w-45">Action</TableHead>
							<TableHead>Performed By</TableHead>
							<TableHead>Details Summary</TableHead>
							<TableHead className="text-right w-25">Inspect</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center h-24 text-muted-foreground"
								>
									No audit logs found matching the filters.
								</TableCell>
							</TableRow>
						) : (
							logs.map((log) => {
								let summary = log.details;
								try {
									const parsed = JSON.parse(log.details);
									if (parsed.name) {
										summary = `${parsed.name} (${parsed.sku || parsed.email || parsed.id || ""})`;
									} else if (parsed.productName) {
										summary = `${parsed.productName} (Qty: ${parsed.qtyChange})`;
									} else if (parsed.type) {
										summary = `${parsed.type} Transaction (${parsed.itemsCount} items)`;
									}
								} catch {}

								return (
									<TableRow key={log.id} className="hover:bg-muted/30">
										<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
											<div className="flex items-center gap-1.5">
												<Calendar className="h-3 w-3" />
												{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={getActionBadgeVariant(log.action)}
												className={`font-semibold text-[11px] px-2 py-0.5 tracking-wide uppercase ${getActionBadgeColorClass(
													log.action,
												)}`}
											>
												{log.action.replace("_", " ")}
											</Badge>
										</TableCell>
										<TableCell className="text-sm font-medium">
											<div className="flex flex-col">
												<div className="flex items-center gap-1">
													<User className="h-3.5 w-3.5 text-muted-foreground" />
													<span>{log.user?.name || "Deleted User"}</span>
												</div>
												<span className="text-[11px] text-muted-foreground ml-4.5">
													{log.user?.email || ""}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-xs text-muted-foreground font-mono max-w-md truncate">
											{summary}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setSelectedLog(log)}
												className="h-8 w-8 cursor-pointer"
											>
												<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
												<span className="sr-only">Inspect Details</span>
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			{metadata.pageCount > 1 && (
				<div className="flex items-center justify-end gap-2 py-4">
					<Button
						variant="outline"
						size="sm"
						disabled={metadata.currentPage === 1}
						onClick={() => handlePageChange(metadata.currentPage - 1)}
						className="cursor-pointer"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Previous
					</Button>
					<div className="text-xs text-muted-foreground px-2">
						Page {metadata.currentPage} of {metadata.pageCount}
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={metadata.currentPage === metadata.pageCount}
						onClick={() => handlePageChange(metadata.currentPage + 1)}
						className="cursor-pointer"
					>
						Next
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>
			)}

			{/* Inspect Dialog */}
			<Dialog
				open={!!selectedLog}
				onOpenChange={(open) => !open && setSelectedLog(null)}
			>
				<DialogContent className="sm:max-w-137.5">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Info className="h-5 w-5 text-primary" />
							Log Details
						</DialogTitle>
						<DialogDescription>
							Full database payloads and connection context captured for this
							operation.
						</DialogDescription>
					</DialogHeader>

					{selectedLog && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-3 gap-2 text-sm border-b pb-3">
								<div>
									<span className="font-semibold text-muted-foreground text-xs block">
										TIMESTAMP
									</span>
									<span>
										{format(
											new Date(selectedLog.createdAt),
											"yyyy-MM-dd HH:mm:ss",
										)}
									</span>
								</div>
								<div>
									<span className="font-semibold text-muted-foreground text-xs block">
										ACTION
									</span>
									<Badge
										variant={getActionBadgeVariant(selectedLog.action)}
										className={`mt-1 font-semibold uppercase text-[10px] ${getActionBadgeColorClass(
											selectedLog.action,
										)}`}
									>
										{selectedLog.action}
									</Badge>
								</div>
								<div>
									<span className="font-semibold text-muted-foreground text-xs block">
										PERFORMED BY
									</span>
									<span className="truncate block font-medium">
										{selectedLog.user?.name || "Deleted User"}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<span className="font-semibold text-muted-foreground text-xs block">
									PAYLOAD DATA
								</span>
								<div className="max-h-75 overflow-auto rounded-md bg-muted p-4 font-mono text-[11px] leading-relaxed select-all">
									<pre>{formatDetails(selectedLog.details)}</pre>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
