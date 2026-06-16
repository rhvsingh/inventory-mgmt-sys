import { Roles } from "./roles";
import type {
	Action,
	AuthUser,
	PolicyDecision,
	PolicyFn,
	ResourceAttributes,
} from "./types";

export const POLICIES: Partial<Record<Action, PolicyFn>> = {
	"transactions:create": (user, attrs) => {
		if (
			attrs?.transaction &&
			!user.permissions.includes("transactions:create_purchase")
		) {
			const type = (attrs.transaction as { type: string }).type;
			if (type !== "SALE") {
				return {
					allowed: false,
					reason:
						"Unauthorized. You are only permitted to record sale transactions.",
				};
			}
		}
		return { allowed: true };
	},
	"transactions:read": (user, attrs) => {
		if (attrs?.transaction && Roles.isClerk(user)) {
			const userId = (attrs.transaction as { userId: string }).userId;
			if (userId !== user.id) {
				return {
					allowed: false,
					reason: "Access denied. Clerks can only view their own transactions.",
				};
			}
		}
		return { allowed: true };
	},
	"adjustments:create": (user, attrs) => {
		if (
			attrs?.adjustment &&
			!user.permissions.includes("adjustments:create_unbounded")
		) {
			const qtyChange = (attrs.adjustment as { qtyChange: number }).qtyChange;
			if (Math.abs(qtyChange) > 50) {
				return {
					allowed: false,
					reason:
						"Unauthorized. You are capped at stock adjustments of up to 50 units.",
				};
			}
		}
		if (attrs?.product) {
			const isArchived = (attrs.product as { isArchived: boolean }).isArchived;
			if (isArchived) {
				return {
					allowed: false,
					reason:
						"Unauthorized. Cannot perform stock adjustments on archived products.",
				};
			}
		}
		return { allowed: true };
	},
	"users:update": (user, attrs) => {
		if (attrs?.userProfile) {
			const id = (attrs.userProfile as { id: string }).id;
			if (!user.permissions.includes("users:update") && id !== user.id) {
				return {
					allowed: false,
					reason:
						"Unauthorized. You are only permitted to update your own profile.",
				};
			}
		}
		return { allowed: true };
	},
	"users:delete": (user, attrs) => {
		if (attrs?.userProfile) {
			const id = (attrs.userProfile as { id: string }).id;
			const roleName = (attrs.userProfile as { role: string }).role;
			const isLastAdmin = (attrs.userProfile as { isLastAdmin?: boolean })
				.isLastAdmin;

			if (id === user.id) {
				return {
					allowed: false,
					reason: "Security block. You cannot delete your own account.",
				};
			}
			if (roleName.toLowerCase() === "admin" && isLastAdmin) {
				return {
					allowed: false,
					reason:
						"Security block. Cannot delete the last Administrator account in the system.",
				};
			}
		}
		return { allowed: true };
	},
	"products:delete": (_user, attrs) => {
		if (attrs?.product) {
			const hasDependencies = (attrs.product as { hasDependencies?: boolean })
				.hasDependencies;
			if (hasDependencies) {
				return {
					allowed: false,
					reason:
						"Dependency constraint. Cannot delete product with sales or adjustments history. Archive it instead.",
				};
			}
		}
		return { allowed: true };
	},
};

export function evaluatePolicy(
	action: Action,
	user: AuthUser,
	attrs?: ResourceAttributes,
): PolicyDecision | null {
	const policy = POLICIES[action];
	if (!policy) return null;
	return policy(user, attrs);
}
