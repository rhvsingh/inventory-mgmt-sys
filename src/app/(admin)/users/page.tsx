import { redirect } from "next/navigation"
import { getUsers } from "@/actions/user"
import { auth } from "@/auth"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { UserList } from "./_components/user-list"

export default async function UsersPage() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const users = await getUsers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <CreateUserDialog />
            </div>
            <UserList users={users} />
        </div>
    )
}
