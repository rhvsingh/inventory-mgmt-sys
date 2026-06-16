import { getUsers } from "@/actions/user"
import { UserList } from "./user-list"

interface UserListWrapperProps {
    page: number
    roles: { id: string; name: string }[]
}

export async function UserListWrapper({ page, roles }: UserListWrapperProps) {
    const { data: users, metadata } = await getUsers(page)

    return <UserList users={users} roles={roles} metadata={metadata} />
}
