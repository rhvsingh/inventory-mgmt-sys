"use client";

import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { refreshReportData } from "@/actions/reports";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
	const [isPending, startTransition] = useTransition();

	const handleRefresh = () => {
		startTransition(async () => {
			try {
				await refreshReportData();
				toast.success("Reports refreshed");
			} catch {
				toast.error("Failed to refresh reports");
			}
		});
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleRefresh}
			disabled={isPending}
		>
			<RefreshCw
				className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
			/>
			Refresh Data
		</Button>
	);
}
