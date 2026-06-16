"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending}>
			{pending ? "Saving..." : "Save Changes"}
		</Button>
	);
}

interface EditUserDialogProps {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	roles: { id: string; name: string }[];
}

export function EditUserDialog({ user, roles }: EditUserDialogProps) {
	const [open, setOpen] = useState(false);

	async function clientAction(formData: FormData) {
		const res = await updateUser(null, formData);
		if (res?.error) {
			toast.error(res.error);
			if (res.issues) {
				res.issues.forEach((i) => {
					toast.error(i.message);
				});
			}
		} else {
			toast.success("User updated successfully");
			setOpen(false);
		}
	}

	const currentRole = roles.find((r) => r.name === user.role);
	const defaultRoleId = currentRole?.id || roles[0]?.id;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-muted cursor-pointer"
				>
					<Pencil className="h-4 w-4 text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form action={clientAction}>
					<input type="hidden" name="id" value={user.id} />
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Update user profile and assign dynamic database role.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								name="name"
								defaultValue={user.name}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								defaultValue={user.email}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="roleId" className="text-right">
								Role
							</Label>
							<Select name="roleId" defaultValue={defaultRoleId}>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<SubmitButton />
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
