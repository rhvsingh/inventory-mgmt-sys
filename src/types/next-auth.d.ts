import type { DefaultSession } from "next-auth";
// biome-ignore lint/correctness/noUnusedImports: required for TypeScript module augmentation merging
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			id: string;
			role: string;
			permissions: string[];
		} & DefaultSession["user"];
	}

	interface User {
		roleId: string;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT {
		role: string;
		permissions: string[];
	}
}

declare module "@auth/core/adapters" {
	interface AdapterUser {
		roleId: string;
	}
}
