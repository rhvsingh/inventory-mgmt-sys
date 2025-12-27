import { Bell, Settings } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { checkLowStock } from "@/actions/notifications"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotificationBell({ role }: { role?: string }) {
    const [alerts, setAlerts] = useState<{ id: string; name: string; stockQty: number; minStock: number }[]>([])
    const [intervalSeconds, setIntervalSeconds] = useState(30)

    // Load interval from local storage on mount and listen for changes
    useEffect(() => {
        // Function to load interval
        const loadInterval = () => {
            const stored = localStorage.getItem("notification-interval")
            if (stored) {
                const val = parseInt(stored)
                if (!isNaN(val) && val > 0) {
                    setIntervalSeconds(val)
                }
            }
        }

        loadInterval()

        // Listen for changes from settings page
        window.addEventListener("notification-interval-change", loadInterval)
        return () => window.removeEventListener("notification-interval-change", loadInterval)
    }, [])

    useEffect(() => {
        const fetchAlerts = async () => {
            const data = await checkLowStock()
            setAlerts(data)
        }

        fetchAlerts()
        const interval = setInterval(fetchAlerts, intervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [intervalSeconds])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {alerts.length > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {(role === "ADMIN" || role === "MANAGER") && (
                        <Link href="/settings" title="Notification Settings">
                            <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </Link>
                    )}
                </div>
                <DropdownMenuSeparator />
                {alerts.length === 0 ? (
                    <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                ) : (
                    alerts.map((alert) => (
                        <DropdownMenuItem key={alert.id} asChild>
                            <Link
                                href="/suppliers/low-stock"
                                className="flex flex-col items-start gap-1 cursor-pointer"
                            >
                                <span className="font-medium text-destructive">Low Stock Alert</span>
                                <span className="text-xs text-muted-foreground">
                                    {alert.name} is low ({alert.stockQty} / {alert.minStock})
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
