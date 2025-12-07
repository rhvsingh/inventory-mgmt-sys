"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeSelector() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Delay to avoid synchronous state update warning
        const timer = setTimeout(() => setMounted(true), 0)
        return () => clearTimeout(timer)
    }, [])

    if (!mounted) return null

    return (
        <div className="grid grid-cols-3 gap-2">
            <Button
                variant="outline"
                onClick={() => setTheme("light")}
                className={cn(
                    "flex flex-col items-center justify-between h-auto py-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    theme === "light" ? "border-primary" : "border-muted"
                )}
            >
                <Sun className="mb-2 h-6 w-6" />
                <span className="text-xs font-medium">Light</span>
            </Button>
            <Button
                variant="outline"
                onClick={() => setTheme("dark")}
                className={cn(
                    "flex flex-col items-center justify-between h-auto py-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    theme === "dark" ? "border-primary" : "border-muted"
                )}
            >
                <Moon className="mb-2 h-6 w-6" />
                <span className="text-xs font-medium">Dark</span>
            </Button>
            <Button
                variant="outline"
                onClick={() => setTheme("system")}
                className={cn(
                    "flex flex-col items-center justify-between h-auto py-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    theme === "system" ? "border-primary" : "border-muted"
                )}
            >
                <Monitor className="mb-2 h-6 w-6" />
                <span className="text-xs font-medium">System</span>
            </Button>
        </div>
    )
}
