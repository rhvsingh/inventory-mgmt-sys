import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProductTableSkeleton() {
    return (
        <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-20">
                            <Skeleton className="h-4 w-8" />
                        </TableHead>
                        <TableHead className="w-12">
                            <Skeleton className="h-4 w-12" />
                        </TableHead>
                        <TableHead className="w-24">
                            <Skeleton className="h-4 w-24" />
                        </TableHead>
                        <TableHead className="w-16">
                            <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-16">
                            <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-12 text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                        </TableHead>
                        <TableHead className="w-12 text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                        </TableHead>
                        <TableHead className="w-16 text-right">
                            <Skeleton className="h-8 w-8 ml-auto" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-12 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export function FilterSkeleton() {
    return (
        <Skeleton className="h-10 w-24" /> // Button size
    )
}
