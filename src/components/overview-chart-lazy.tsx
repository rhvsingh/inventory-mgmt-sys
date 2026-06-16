"use client"

import dynamic from "next/dynamic"

export const OverviewChartLazy = dynamic(() => import("./overview-chart").then((m) => m.OverviewChart), {
    ssr: false,
    loading: () => (
        <div className="h-87.5 w-full flex items-center justify-center text-muted-foreground text-sm">
            Loading chart...
        </div>
    ),
})
