import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProfitLossSummary } from "@/types";

export function ProfitLossCard({ data }: { data: ProfitLossSummary }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profit & Loss Estimates</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">
							Total Revenue
						</p>
						<div className="text-2xl font-bold text-green-600">
							{formatCurrency(data.totalRevenue)}
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">
							Cost of Goods Sold (Est.)
						</p>
						<div className="text-2xl font-bold text-red-600">
							{formatCurrency(data.totalCostOfGoodsSold)}
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">
							Gross Profit
						</p>
						<div className="text-2xl font-bold">
							{formatCurrency(data.grossProfit)}
						</div>
						<p className="text-xs text-muted-foreground">
							Based on current avg cost
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
