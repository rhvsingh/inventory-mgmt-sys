import { BarChart3, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Truck, Users } from "lucide-react"
import { logout } from "@/app/lib/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/sales", icon: ShoppingCart, label: "Sales" },
    { href: "/purchases", icon: Truck, label: "Purchases" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/users", icon: Users, label: "Users" }, // Admin only usually
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
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
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-muted-foreground">admin@example.com</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
                <form action={logout}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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
