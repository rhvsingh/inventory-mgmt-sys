import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SalesTableSkeleton() {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
