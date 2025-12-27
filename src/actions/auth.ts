"use server"

import { AuthError } from "next-auth"
import { signIn, signOut } from "@/auth"

export async function logout() {
    await signOut()
}

export async function authenticate(_prevState: string | undefined, formData: FormData) {
    try {
        await signIn("credentials", formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}
