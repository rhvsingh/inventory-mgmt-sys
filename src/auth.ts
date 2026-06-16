import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
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

import type { Adapter } from "next-auth/adapters"

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as Adapter,
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("DEBUG AUTH: authorize called with", credentials?.email)
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
                console.log("Invalid credentials")
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
            if (!token.role && token.email) {
                const user = await getUserWithPermissions(token.email)
                if (user?.role) {
                    token.role = user.role.name
                    token.permissions = user.role.permissions.map((p) => p.permission.name)
                }
            }
            return token
        },
    },
})
