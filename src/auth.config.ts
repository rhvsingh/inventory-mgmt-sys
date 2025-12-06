import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith("/login")

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl))
                return true
            }

            // For all other routes (which are protected by matcher), require login
            return isLoggedIn
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
