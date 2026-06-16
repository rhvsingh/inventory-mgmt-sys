import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { TopProductItem } from "@/types";

export function TopProductsTable({ data }: { data: TopProductItem[] }) {
	return (
		<Card className="col-span-1">
			<CardHeader>
				<CardTitle>Top Selling Products</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead className="text-right">Qty Sold</TableHead>
							<TableHead className="text-right">Revenue</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<div className="font-medium">{item.name}</div>
									<div className="text-xs text-muted-foreground">
										{item.sku}
									</div>
								</TableCell>
								<TableCell className="text-right">
									{item.quantitySold}
								</TableCell>
								<TableCell className="text-right">
									{formatCurrency(item.revenue)}
								</TableCell>
							</TableRow>
						))}
						{data.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={3}
									className="text-center h-24 text-muted-foreground"
								>
									No sales data yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
