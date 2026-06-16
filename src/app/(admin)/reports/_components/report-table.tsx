import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export interface Column<T> {
	header: string;
	accessor: (item: T) => React.ReactNode;
	className?: string;
}

interface ReportTableProps<T> {
	title?: string;
	data: T[];
	columns: Column<T>[];
	emptyMessage?: string;
	keyExtractor?: (item: T) => string | number;
}

export function ReportTable<T extends { id?: string | number }>({
	title,
	data,
	columns,
	emptyMessage = "No data available",
	keyExtractor,
}: ReportTableProps<T>) {
	return (
		<Card>
			{title && (
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead key={col.header} className={col.className}>
									{col.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="text-center text-muted-foreground"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						) : (
							data.map((item, rowIndex) => {
								const rowKey = keyExtractor
									? keyExtractor(item)
									: item.id || rowIndex;
								return (
									<TableRow key={rowKey}>
										{columns.map((col) => (
											<TableCell
												key={`${rowKey}-${col.header}`}
												className={col.className}
											>
												{col.accessor(item)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
