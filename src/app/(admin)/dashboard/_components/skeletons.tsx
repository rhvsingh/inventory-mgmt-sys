import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-3 w-[80px]" />
            </CardContent>
        </Card>
    )
}

export function OverviewChartSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <Skeleton className="h-6 w-[100px]" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full" />
            </CardContent>
        </Card>
    )
}

export function RecentSalesSkeleton() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <Skeleton className="h-6 w-[120px]" />
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className="ml-4 space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                            <Skeleton className="ml-auto h-4 w-[80px]" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
