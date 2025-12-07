import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { InventoryCards } from "./_components/inventory-cards"
import { SalesVolumeCard } from "./_components/sales-volume-card"
import { OverviewChartCard } from "./_components/overview-chart-card"
import { RecentSalesCard } from "./_components/recent-sales-card"
import { StatsCardSkeleton, OverviewChartSkeleton, RecentSalesSkeleton } from "./_components/skeletons"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { role } = session.user
    const canSeeFinancials = role === "ADMIN" || role === "MANAGER"

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className={`grid gap-4 md:grid-cols-${canSeeFinancials ? "3" : "1"}`}>
                <Suspense
                    fallback={
                        canSeeFinancials ? (
                            <>
                                <StatsCardSkeleton />
                                <StatsCardSkeleton />
                            </>
                        ) : null
                    }
                >
                    <InventoryCards role={role} />
                </Suspense>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <SalesVolumeCard />
                </Suspense>
            </div>
            <div className={`grid gap-4 ${canSeeFinancials ? "md:grid-cols-2 lg:grid-cols-7" : "grid-cols-1"}`}>
                <Suspense fallback={canSeeFinancials ? <OverviewChartSkeleton /> : null}>
                    <OverviewChartCard role={role} />
                </Suspense>
                <Suspense fallback={<RecentSalesSkeleton />}>
                    <RecentSalesCard />
                </Suspense>
            </div>
        </div>
    )
}
