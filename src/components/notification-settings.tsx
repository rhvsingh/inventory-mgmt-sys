"use client"

import { useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NotificationSettings() {
    const [tempInterval, setTempInterval] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("notification-interval")
            if (stored) {
                const val = parseInt(stored, 10)
                if (!Number.isNaN(val) && val > 0) {
                    return val.toString()
                }
            }
        }
        return "30"
    })
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    const handleSaveSettings = () => {
        const val = parseInt(tempInterval, 10)
        if (!Number.isNaN(val) && val > 0) {
            localStorage.setItem("notification-interval", val.toString())
            // Dispatch a custom event so the bell can update immediately without reload
            window.dispatchEvent(new Event("notification-interval-change"))
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="interval">Interval (seconds)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="interval"
                        value={tempInterval}
                        onChange={(e) => setTempInterval(e.target.value)}
                        className="max-w-30"
                        type="number"
                        min="5"
                        suppressHydrationWarning
                    />
                    <Button size="sm" onClick={handleSaveSettings} className="cursor-pointer">
                        Save
                    </Button>
                </div>
                {isClient && parseInt(tempInterval, 10) < 30 && (
                    <div className="text-xs text-orange-500 flex items-start gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help font-medium">⚠️ High server usage warning</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Intervals less than 30s may cause high server load.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
                <p className="text-xs text-muted-foreground">Frequency to check for low stock alerts.</p>
            </div>
        </div>
    )
}
