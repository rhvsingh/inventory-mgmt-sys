import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/auth"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { UsersTableSkeleton } from "./_components/skeletons"
import { UserListWrapper } from "./_components/user-list-wrapper"

interface UsersPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const params = await searchParams
    const page = Number(params.page) || 1

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <CreateUserDialog />
            </div>
            <Suspense key={page} fallback={<UsersTableSkeleton />}>
                <UserListWrapper page={page} />
            </Suspense>
        </div>
    )
}
