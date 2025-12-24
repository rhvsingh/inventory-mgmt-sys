import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableSkeletonProps {
    columnCount: number
    rowCount?: number
    showToolbar?: boolean
}

export function DataTableSkeleton({ columnCount, rowCount = 5, showToolbar = false }: DataTableSkeletonProps) {
    return (
        <div className="w-full space-y-3 overflow-auto">
            {showToolbar && (
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-37.5" />
                    <Skeleton className="h-8 w-17.5" />
                </div>
            )}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columnCount }).map((_, i) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                                <TableHead key={i}>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rowCount }).map((_, i) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                            <TableRow key={i}>
                                {Array.from({ length: columnCount }).map((_, j) => (
                                    // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Skeleton className="h-8 w-37.5" />
                <Skeleton className="h-8 w-17.5" />
            </div>
        </div>
    )
}
