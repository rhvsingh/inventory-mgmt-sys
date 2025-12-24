import { getUsers } from "@/actions/user"
import { UserList } from "./user-list"

interface UserListWrapperProps {
    page: number
}

export async function UserListWrapper({ page }: UserListWrapperProps) {
    const { data: users, metadata } = await getUsers(page)

    return <UserList users={users} metadata={metadata} />
}
