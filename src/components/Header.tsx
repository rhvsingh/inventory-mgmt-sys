"use client"

import { Menu, Package } from "lucide-react"
import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/NotificationBell"

export function Header() {
    const [open, setOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 bg-transparent shadow-none w-auto">
                    <Sidebar className="w-64 border-r bg-card h-full rounded-r-lg" onClose={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* Mobile Branding */}
            <div className="md:hidden flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6" />
                <span>Sports Shop IMS</span>
            </div>

            {/* Spacer */}
            <div className="w-full flex-1"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <ModeToggle />
                <NotificationBell />
            </div>
        </header>
    )
}
