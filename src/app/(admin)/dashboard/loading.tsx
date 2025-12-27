import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />

            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-25" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <Skeleton className="h-8 w-30" />
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                <Skeleton className="h-3 w-35" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-25" />
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-50 flex items-center justify-center p-6">
                            <Skeleton className="h-full w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-30" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {Array.from({ length: 5 }).map((_, i) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton
                                <div key={i} className="flex items-center">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="ml-4 space-y-1">
                                        <Skeleton className="h-4 w-37.5" />
                                        <Skeleton className="h-3 w-25" />
                                    </div>
                                    <div className="ml-auto">
                                        <Skeleton className="h-4 w-15" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
