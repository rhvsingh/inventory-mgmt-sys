import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <aside className="hidden md:block">
                <Sidebar />
            </aside>
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
            </div>
        </div>
    )
}
