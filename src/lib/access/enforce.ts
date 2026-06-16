import "server-only";

import { auth } from "@/auth";
import { actionToPermissionMap } from "./permissions";
import { evaluatePolicy } from "./policies";
import type {
	Action,
	AuthUser,
	EnforceResult,
	ResourceAttributes,
} from "./types";

export async function enforce(): Promise<EnforceResult>;
export async function enforce(
	action: Action | Action[],
): Promise<EnforceResult>;
export async function enforce(
	action: Action | Action[],
	attributes: ResourceAttributes,
): Promise<EnforceResult>;
export async function enforce(
	action?: Action | Action[],
	attributes?: ResourceAttributes,
): Promise<EnforceResult> {
	// ── Step 1: Authenticate ──────────────────────────────────────
	const session = await auth();
	if (!session?.user) {
		throw new Error("Unauthorized: Please log in.");
	}

	const user = session.user as unknown as AuthUser;

	// If no action specified, this is just an auth check
	if (!action) {
		return {
			session: { user },
		};
	}

	// ── Step 2: RBAC — Check role has required permission(s) dynamically ──────
	const actions = Array.isArray(action) ? action : [action];

	for (const act of actions) {
		const requiredPermission = actionToPermissionMap[act];
		const isSelfUpdate =
			act === "users:update" &&
			attributes?.userProfile &&
			(attributes.userProfile as { id: string }).id === user.id;

		const passesRBAC =
			isSelfUpdate || user.permissions.includes(requiredPermission);

		if (!passesRBAC) {
			throw new Error(
				`Forbidden: You do not have permission to perform this action. Required permission: '${requiredPermission}'.`,
			);
		}
	}

	// ── Step 3: ABAC — Evaluate policies for conditional access ───
	let mergedConditions: Record<string, unknown> = {};

	for (const act of actions) {
		const decision = evaluatePolicy(act, user, attributes);

		// If no policy exists for this action, RBAC alone is sufficient
		if (!decision) continue;

		if (!decision.allowed) {
			throw new Error(decision.reason);
		}

		// Merge conditions from all policies
		if (decision.conditions) {
			mergedConditions = { ...mergedConditions, ...decision.conditions };
		}
	}

	return {
		session: { user },
		conditions:
			Object.keys(mergedConditions).length > 0 ? mergedConditions : undefined,
	};
}

export const Authz = {
	check: (
		user: AuthUser,
		action: Action,
		attrs?: ResourceAttributes,
	): { authorized: boolean; reason?: string } => {
		try {
			const requiredPermission = actionToPermissionMap[action];
			const isSelfUpdate =
				action === "users:update" &&
				attrs?.userProfile &&
				(attrs.userProfile as { id: string }).id === user.id;

			const passesRBAC =
				isSelfUpdate || user.permissions.includes(requiredPermission);

			if (!passesRBAC) {
				return {
					authorized: false,
					reason: `Permission '${requiredPermission}' is required to perform this action.`,
				};
			}

			const decision = evaluatePolicy(action, user, attrs);
			if (decision && !decision.allowed) {
				return {
					authorized: false,
					reason: decision.reason,
				};
			}

			return { authorized: true };
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Unauthorized";
			return { authorized: false, reason: message };
		}
	},
};
