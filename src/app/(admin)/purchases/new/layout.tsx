import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata: Metadata = {
    title: "New Purchase",
}

export default async function NewPurchaseLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session || !session.user.permissions?.includes("transactions:create")) {
        redirect("/dashboard")
    }
    return <>{children}</>
}
