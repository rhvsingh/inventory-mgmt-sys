import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getPermissionsList, getRoles } from "@/actions/role";
import { auth } from "@/auth";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleDialog } from "./_components/role-dialog";
import { RoleList } from "./_components/role-list";
import { UserListWrapper } from "./_components/user-list-wrapper";

export const metadata: Metadata = {
	title: "Access Control",
};

interface UsersPageProps {
	searchParams: Promise<{ page?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("users:read")) {
		redirect("/dashboard");
	}

	const params = await searchParams;
	const page = Number(params.page) || 1;

	const [roles, allPermissions] = await Promise.all([
		getRoles(),
		getPermissionsList(),
	]);

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-3xl font-bold tracking-tight">Access Control</h1>

			<Tabs defaultValue="users" className="w-full">
				<TabsList className="grid w-full grid-cols-2 max-w-[400px]">
					<TabsTrigger value="users">User Accounts</TabsTrigger>
					<TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="flex flex-col gap-4 mt-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">User Accounts</h2>
						<CreateUserDialog roles={roles} />
					</div>
					<Suspense key={page} fallback={<DataTableSkeleton columnCount={5} />}>
						<UserListWrapper page={page} roles={roles} />
					</Suspense>
				</TabsContent>

				<TabsContent value="roles" className="flex flex-col gap-4 mt-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Dynamic Roles</h2>
						<RoleDialog allPermissions={allPermissions} />
					</div>
					<RoleList roles={roles} allPermissions={allPermissions} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
