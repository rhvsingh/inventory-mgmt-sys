"use client";

import { Settings2 } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { productColumns } from "./product-columns";

interface ColumnToggleProps {
	visibleColumns: Set<string>;
	onToggle: (column: string) => void;
}

export const ColumnToggle = memo(function ColumnToggle({
	visibleColumns,
	onToggle,
}: ColumnToggleProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 h-8">
					<Settings2 className="h-4 w-4" />
					Columns
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{productColumns.map((column) => (
					<DropdownMenuCheckboxItem
						key={column.id}
						checked={visibleColumns.has(column.id)}
						onCheckedChange={() => onToggle(column.id)}
					>
						{column.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
