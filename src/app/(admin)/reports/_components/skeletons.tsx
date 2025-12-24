import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            <Skeleton className="h-4 w-24" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TableSkeleton() {
    return (
        <div className="rounded-md border">
            <div className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
