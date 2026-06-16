import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getAuditLogs } from "@/actions/audit"
import { auth } from "@/auth"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { AuditLogList } from "./_components/audit-log-list"

export const metadata: Metadata = {
    title: "System Audit Logs",
}

interface AuditLogsPageProps {
    searchParams: Promise<{ page?: string; q?: string; action?: string }>
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
    const session = await auth()
    if (!session || !session.user.permissions?.includes("audit_logs:read")) {
        redirect("/dashboard")
    }

    const { page: pageStr, q: searchRaw, action: actionRaw } = await searchParams
    const page = Number(pageStr) || 1
    const search = searchRaw || ""
    const action = actionRaw || ""

    const { data: logs, metadata } = await getAuditLogs({ page, search, action })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">System Audit Logs</h1>
                <p className="text-muted-foreground text-sm">
                    Immutable trail of all critical database operations, creations, updates, and deletions.
                </p>
            </div>

            <Suspense key={`${page}-${search}-${action}`} fallback={<DataTableSkeleton columnCount={5} />}>
                <AuditLogList logs={logs} metadata={metadata} search={search} action={action} />
            </Suspense>
        </div>
    )
}
