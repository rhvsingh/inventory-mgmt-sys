import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { auth } from "@/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const user = session?.user || { name: "User", email: "", role: "CLERK" }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <aside className="hidden md:block">
                <Sidebar user={user} />
            </aside>
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
            </div>
        </div>
    )
}
