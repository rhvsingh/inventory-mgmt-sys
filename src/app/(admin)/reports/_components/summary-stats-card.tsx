import { CreditCard, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryStatsProps {
	// title: string // Unused
	stats: {
		label: string;
		value: string | number;
		subtext?: string;
		icon?: "currency" | "users" | "cart" | "trending";
	}[];
}

export function SummaryStatsCard({ stats }: SummaryStatsProps) {
	const getIcon = (type?: string) => {
		switch (type) {
			case "currency":
				return <CreditCard className="h-4 w-4 text-muted-foreground" />;
			case "users":
				return <Users className="h-4 w-4 text-muted-foreground" />;
			case "cart":
				return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
			case "trending":
				return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
			default:
				return null;
		}
	};

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
						{getIcon(stat.icon)}
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
						{stat.subtext && (
							<p className="text-xs text-muted-foreground">{stat.subtext}</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
