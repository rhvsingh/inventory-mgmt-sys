"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

import { actionToPermissionMap } from "./permissions";
import type { Action } from "./types";

/**
 * Check if the current user has a specific permission dynamically.
 *
 * Usage:
 *   const canCreateProduct = usePermission("products:create")
 *   if (!canCreateProduct) return null
 */
export function usePermission(action: Action): boolean {
	const { data: session } = useSession();

	return useMemo(() => {
		const permissions = session?.user?.permissions;
		if (!permissions) return false;
		const requiredPermission = actionToPermissionMap[action];
		return permissions.includes(requiredPermission);
	}, [session?.user?.permissions, action]);
}

/**
 * Check multiple permissions at once. Returns a map of action → boolean.
 *
 * Usage:
 *   const perms = usePermissions(["products:create", "users:create"])
 *   if (perms["products:create"]) { ... }
 */
export function usePermissions<T extends Action>(
	actions: readonly T[],
): Record<T, boolean> {
	const { data: session } = useSession();

	return useMemo(() => {
		const result = {} as Record<T, boolean>;
		const permissions = session?.user?.permissions || [];

		for (const act of actions) {
			const requiredPermission = actionToPermissionMap[act];
			result[act] = permissions.includes(requiredPermission);
		}

		return result;
	}, [session?.user?.permissions, actions]);
}

/**
 * Get the current user's role.
 *
 * Usage:
 *   const role = useRole()
 *   const isAdmin = role === "Admin"
 */
export function useRole(): string | undefined {
	const { data: session } = useSession();
	return session?.user?.role;
}
