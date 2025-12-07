import { redirect } from "next/navigation"

import { getInventoryValuation, getLowStockReport, getSalesHistory } from "@/actions/reports"
import { auth } from "@/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LowStockTable } from "./_components/low-stock-table"
import { ReportCards } from "./_components/report-cards"
import { SalesHistoryTable } from "./_components/sales-history-table"
import { ValuationTable } from "./_components/valuation-table"

export default async function ReportsPage() {
    const session = await auth()
    const role = session?.user?.role

    if (!session || (role !== "ADMIN" && role !== "MANAGER")) {
        redirect("/dashboard")
    }

    const [lowStockProducts, { params: valuation, products: allProducts }, salesHistory] = await Promise.all([
        getLowStockReport(),
        getInventoryValuation(),
        getSalesHistory(),
    ])

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>

            <ReportCards valuation={valuation} lowStockCount={lowStockProducts.length} totalSkus={allProducts.length} />

            <Tabs defaultValue="valuation" className="space-y-4">
                <TabsList>
                    <TabsTrigger className="cursor-pointer" value="valuation">
                        Valuation Report
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="low-stock">
                        Low Stock
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="sales">
                        Sales History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="valuation" className="space-y-4">
                    <ValuationTable products={allProducts} />
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                    <LowStockTable products={lowStockProducts} />
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <SalesHistoryTable transactions={salesHistory} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
