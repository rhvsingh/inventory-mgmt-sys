"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Tabs } from "@/components/ui/tabs"

interface ReportTabsProps {
    children: React.ReactNode
    defaultValue: string
}

export function ReportTabs({ children, defaultValue }: ReportTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // We trust the parent to pass the correct default based on server params,
    // but we can also double check client side params if needed.
    // For simplicity and consistency with server rendering, we rely on the passed prop
    // which effectively mirrors the server's view of the URL.
    const currentTab = searchParams.get("tab") || defaultValue

    return (
        <Tabs
            defaultValue={defaultValue}
            value={currentTab}
            onValueChange={(value) => {
                router.push(`?tab=${value}`)
            }}
            className="space-y-4"
        >
            {children}
        </Tabs>
    )
}
