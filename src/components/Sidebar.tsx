"use client"

import { BarChart3, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Truck, Users } from "lucide-react"
import { logout } from "@/actions/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/sales", icon: ShoppingCart, label: "Sales" },
    { href: "/purchases", icon: Truck, label: "Purchases" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/users", icon: Users, label: "Users" }, // Admin only usually
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose?: () => void
    user: {
        name?: string | null
        email?: string | null
        role?: string
    }
}

export function Sidebar({ className, onClose, user }: SidebarProps) {
    const pathname = usePathname()

    // Filter nav items based on role
    const filteredNavItems = navItems.filter((item) => {
        const role = user.role
        if (item.href === "/users") {
            return role === "ADMIN"
        }
        if (item.href === "/reports") {
            return role === "ADMIN" || role === "MANAGER"
        }
        return true
    })

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-card text-card-foreground", className)}>
            <div className="flex h-14 lg:h-[60px] items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={onClose}>
                    <Package className="h-6 w-6" />
                    <span>Sports Shop IMS</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">{user.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                    </div>
                </div>
                <Link
                    href="/settings"
                    className={cn("flex items-center gap-3 rounded-lg", pathname === "/settings" ? "bg-muted" : "")}
                >
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-2 text-muted-foreground hover:text-primary cursor-pointer",
                            pathname === "/settings" ? "text-primary" : ""
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                </Link>
                <form action={logout}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                        type="submit"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </form>
            </div>
        </div>
    )
}
