import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import type { Adapter } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

async function getUserWithPermissions(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user with permissions:", error)
        throw new Error("Failed to fetch user with permissions.")
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as Adapter,
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await getUser(email)
                    if (!user) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user
                }
                return null
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
                session.user.role = token.role as string
                session.user.permissions = (token.permissions as string[]) || []
            }
            return session
        },
        async jwt({ token }) {
            // SEC-05: Re-fetch permissions periodically to pick up role/permission changes
            const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
            const lastUpdated = (token.permissionsUpdatedAt as number) || 0
            const shouldRefresh = !token.role || Date.now() - lastUpdated > REFRESH_INTERVAL_MS

            if (shouldRefresh && token.email) {
                const user = await getUserWithPermissions(token.email)
                if (user?.role) {
                    token.role = user.role.name
                    token.permissions = user.role.permissions.map((p) => p.permission.name)
                    token.permissionsUpdatedAt = Date.now()
                }
            }
            return token
        },
    },
})
