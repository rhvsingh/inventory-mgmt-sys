"use server";

import "server-only";
import bcrypt from "bcryptjs";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Authz } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/prisma-utils";
import type { ActionState, User } from "@/types";

const getCachedUsers = async (page: number, limit: number) => {
	"use cache";
	cacheTag("users", `page-${page}`);
	cacheLife("hours");

	const skip = (page - 1) * limit;

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: {
					select: {
						name: true,
					},
				},
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limit,
		}),
		prisma.user.count(),
	]);

	return {
		users: users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role.name,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
		})),
		total,
	};
};

export async function getUsers(
	page: number = 1,
	limit: number = 50,
): Promise<{
	data: User[];
	metadata: { total: number; page: number; totalPages: number };
}> {
	const session = await auth();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	const authCheck = Authz.check(session.user, "users:read");
	if (!authCheck.authorized) {
		throw new Error(authCheck.reason || "Unauthorized");
	}

	const { users, total } = await getCachedUsers(page, limit);
	const totalPages = Math.ceil(total / limit);

	return {
		data: serializePrisma(users) as User[],
		metadata: {
			total,
			page,
			totalPages,
		},
	};
}

const userSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must be 6+ chars"),
	roleId: z.string().min(1, "Role is required"),
});

const updateUserSchema = z.object({
	id: z.string().min(1, "User ID is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	roleId: z.string().min(1, "Role is required"),
});

export async function createUser(
	_prevState: ActionState | null,
	formData: FormData,
): Promise<ActionState> {
	const session = await auth();
	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	const authCheck = Authz.check(session.user, "users:create");
	if (!authCheck.authorized) {
		return { error: authCheck.reason || "Unauthorized" };
	}

	const rawData = {
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		roleId: formData.get("roleId"),
	};

	const validated = userSchema.safeParse(rawData);

	if (!validated.success) {
		return {
			error: "Invalid data",
			issues: validated.error.issues.map((i) => ({
				message: i.message,
				path: i.path.filter(
					(p): p is string | number =>
						typeof p === "string" || typeof p === "number",
				),
			})),
		};
	}

	try {
		const role = await prisma.role.findUnique({
			where: { id: validated.data.roleId },
		});
		if (!role) {
			return { error: "Role not found in the database." };
		}

		const hashedPassword = await bcrypt.hash(validated.data.password, 10);

		await prisma.user.create({
			data: {
				name: validated.data.name,
				email: validated.data.email,
				password: hashedPassword,
				roleId: role.id,
			},
		});

		revalidateTag("users", "hours");
		return { success: true };
	} catch (e) {
		console.error(e);
		return { error: "Failed to create user (Email might be taken)" };
	}
}

export async function updateUser(
	_prevState: ActionState | null,
	formData: FormData,
): Promise<ActionState> {
	const session = await auth();
	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	const rawData = {
		id: formData.get("id"),
		name: formData.get("name"),
		email: formData.get("email"),
		roleId: formData.get("roleId"),
	};

	const validated = updateUserSchema.safeParse(rawData);
	if (!validated.success) {
		return {
			error: "Invalid data",
			issues: validated.error.issues.map((i) => ({
				message: i.message,
				path: i.path.filter(
					(p): p is string | number =>
						typeof p === "string" || typeof p === "number",
				),
			})),
		};
	}

	try {
		const authCheck = Authz.check(session.user, "users:update", {
			userProfile: {
				id: validated.data.id,
				role: "",
			},
		});
		if (!authCheck.authorized) {
			return { error: authCheck.reason || "Unauthorized" };
		}

		const role = await prisma.role.findUnique({
			where: { id: validated.data.roleId },
		});
		if (!role) {
			return { error: "Selected role not found." };
		}

		const userToUpdate = await prisma.user.findUnique({
			where: { id: validated.data.id },
			include: { role: true },
		});

		if (!userToUpdate) {
			return { error: "User not found." };
		}

		// Security constraint: Do not allow demoting the last administrator.
		if (userToUpdate.role.name === "Admin" && role.name !== "Admin") {
			const adminRole = await prisma.role.findUnique({
				where: { name: "Admin" },
			});
			if (adminRole) {
				const adminCount = await prisma.user.count({
					where: { roleId: adminRole.id },
				});
				if (adminCount <= 1) {
					return {
						error:
							"Security block. Cannot demote the last system Administrator.",
					};
				}
			}
		}

		await prisma.user.update({
			where: { id: validated.data.id },
			data: {
				name: validated.data.name,
				email: validated.data.email,
				roleId: validated.data.roleId,
			},
		});

		revalidateTag("users", "hours");
		return { success: true };
	} catch (e) {
		console.error(e);
		return { error: "Failed to update user. Email might be already in use." };
	}
}

export async function deleteUser(userId: string): Promise<ActionState> {
	const session = await auth();
	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	try {
		const userToDelete = await prisma.user.findUnique({
			where: { id: userId },
			include: { role: true },
		});
		if (!userToDelete) {
			return { error: "User not found" };
		}

		// Check if target role is Admin and count admins for last admin check
		let isLastAdmin = false;
		if (userToDelete.role.name === "Admin") {
			const adminRole = await prisma.role.findUnique({
				where: { name: "Admin" },
			});
			if (adminRole) {
				const adminCount = await prisma.user.count({
					where: { roleId: adminRole.id },
				});
				isLastAdmin = adminCount <= 1;
			}
		}

		const authCheck = Authz.check(session.user, "users:delete", {
			userProfile: {
				id: userId,
				role: userToDelete.role.name,
				isLastAdmin,
			},
		});
		if (!authCheck.authorized) {
			return { error: authCheck.reason || "Unauthorized" };
		}

		await prisma.user.delete({
			where: { id: userId },
		});
		revalidateTag("users", "hours");
		return { success: true };
	} catch {
		return { error: "Failed to delete user" };
	}
}

export async function updateProfile(
	_prevState: ActionState | null,
	formData: FormData,
): Promise<ActionState> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const rawData = {
		name: formData.get("name"),
		email: formData.get("email"),
	};

	// Simple validation
	if (!rawData.name || !rawData.email) {
		return { error: "Name and email are required" };
	}

	try {
		const id = formData.get("id") as string;
		if (!id) return { error: "User ID missing" };

		const authCheck = Authz.check(session.user, "users:update", {
			userProfile: {
				id,
				role: "",
			},
		});
		if (!authCheck.authorized) {
			return { error: authCheck.reason || "Unauthorized" };
		}

		await prisma.user.update({
			where: { id },
			data: {
				name: rawData.name as string,
				email: rawData.email as string,
			},
		});

		revalidateTag("users", "hours"); // Update users list if name changed
		return { success: true };
	} catch {
		return { error: "Failed to update profile" };
	}
}
