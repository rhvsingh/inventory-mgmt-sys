"use client";

import { Trash2, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { deleteRole } from "@/actions/role";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { PermissionDB, RoleDB } from "@/types";

const RoleDialog = dynamic(
	() => import("./role-dialog").then((m) => m.RoleDialog),
	{
		ssr: false,
	},
);

interface RoleListProps {
	roles: RoleDB[];
	allPermissions: PermissionDB[];
}

export function RoleList({ roles, allPermissions }: RoleListProps) {
	async function handleDelete(roleId: string, roleName: string) {
		const res = await deleteRole(roleId);
		if (res?.error) {
			toast.error(res.error);
		} else {
			toast.success(`Role "${roleName}" deleted successfully`);
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader>
					<CardTitle>System Roles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-37.5">Role Name</TableHead>
									<TableHead className="w-50">Description</TableHead>
									<TableHead>Permissions</TableHead>
									<TableHead className="w-25 text-center">Users</TableHead>
									<TableHead className="w-25 text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{roles.map((role) => {
									const isSystemAdmin = role.name === "Admin";
									const userCount = role._count?.users || 0;
									const mappedPermissions = role.permissions.map(
										(p: { permission: PermissionDB }) => p.permission.name,
									);

									return (
										<TableRow key={role.id}>
											<TableCell className="font-semibold">
												{role.name}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{role.description || "No description provided"}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1.5 max-w-125">
													{mappedPermissions.length === 0 ? (
														<span className="text-xs text-muted-foreground italic">
															No permissions assigned
														</span>
													) : isSystemAdmin ? (
														<Badge className="bg-primary/20 text-primary border-transparent hover:bg-primary/20">
															Full Access
														</Badge>
													) : (
														mappedPermissions.map((permName: string) => (
															<Badge
																key={permName}
																variant="secondary"
																className="text-[11px] font-normal"
															>
																{permName}
															</Badge>
														))
													)}
												</div>
											</TableCell>
											<TableCell className="text-center font-medium">
												<div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs">
													<Users className="h-3 w-3 text-muted-foreground" />
													{userCount}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="inline-flex items-center gap-2">
													<RoleDialog
														role={role}
														allPermissions={allPermissions}
													/>

													{!isSystemAdmin && (
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
																	disabled={userCount > 0}
																	title={
																		userCount > 0
																			? "Cannot delete role with active users"
																			: "Delete role"
																	}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Are you sure?
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		This action cannot be undone. This will
																		permanently delete the role &quot;
																		{role.name}
																		&quot;.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleDelete(role.id, role.name)
																		}
																		className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																	>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
