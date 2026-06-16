import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/auth"

import { InventoryCards } from "./_components/inventory-cards"
import { LowStockCard } from "./_components/low-stock-card"
import { OverviewChartCard } from "./_components/overview-chart-card"
import { RecentSalesCard } from "./_components/recent-sales-card"
import { SalesVolumeCard } from "./_components/sales-volume-card"
import { OverviewChartSkeleton, RecentSalesSkeleton, StatsCardSkeleton } from "./_components/skeletons"

export const metadata: Metadata = {
    title: "Dashboard",
}

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const permissions = session.user.permissions || []
    const canSeeValuation = permissions.includes("reports:valuation")
    const canSeeHistory = permissions.includes("reports:history")

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className={`grid gap-4 md:grid-cols-${canSeeValuation ? "3" : "1"}`}>
                <Suspense
                    fallback={
                        canSeeValuation ? (
                            <>
                                <StatsCardSkeleton />
                                <StatsCardSkeleton />
                            </>
                        ) : null
                    }
                >
                    <InventoryCards permissions={permissions} />
                </Suspense>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <SalesVolumeCard />
                </Suspense>
            </div>
            <div className={`grid gap-4 ${canSeeHistory ? "md:grid-cols-2 lg:grid-cols-7" : "grid-cols-1"}`}>
                <Suspense fallback={canSeeHistory ? <OverviewChartSkeleton /> : null}>
                    <OverviewChartCard permissions={permissions} />
                </Suspense>
                <Suspense fallback={<RecentSalesSkeleton />}>
                    <RecentSalesCard />
                </Suspense>
                <Suspense fallback={<RecentSalesSkeleton />}>
                    <LowStockCard permissions={permissions} />
                </Suspense>
            </div>
        </div>
    )
}
