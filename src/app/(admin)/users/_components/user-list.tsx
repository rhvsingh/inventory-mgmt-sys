"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserActions } from "@/components/user-actions"
import { formatDate } from "@/lib/utils"
import type { User } from "@/types"

interface UserListProps {
    users: User[]
    metadata: {
        total: number
        page: number
        totalPages: number
    }
}

import { Pagination } from "@/components/pagination"

export function UserList({ users, metadata }: UserListProps) {
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-12.5"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.createdAt ? formatDate(user.createdAt) : "N/A"}</TableCell>
                                        <TableCell>
                                            <UserActions userId={user.id} userName={user.name} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {metadata.totalPages > 1 && (
                <Pagination
                    totalPages={metadata.totalPages}
                    currentPage={metadata.page}
                    totalItems={metadata.total}
                    pageSize={50}
                />
            )}
        </div>
    )
}
