import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-25" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-30 mb-2" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    )
}

export function OverviewChartSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <Skeleton className="h-6 w-30" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-87.5 w-full" />
            </CardContent>
        </Card>
    )
}

export function RecentSalesSkeleton() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <Skeleton className="h-6 w-30" />
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton
                        <div key={i} className="flex items-center">
                            <div className="ml-4 space-y-2">
                                <Skeleton className="h-4 w-37.5" />
                                <Skeleton className="h-3 w-25" />
                            </div>
                            <Skeleton className="ml-auto h-4 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
