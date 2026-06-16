import type { AuthUser } from "./types";

export function isRole(user: AuthUser, roleName: string): boolean {
	return user.role.toLowerCase() === roleName.toLowerCase();
}

export const Roles = {
	isAdmin: (user: AuthUser) => isRole(user, "Admin"),
	isManager: (user: AuthUser) => isRole(user, "Manager"),
	isClerk: (user: AuthUser) => isRole(user, "Clerk"),
};
