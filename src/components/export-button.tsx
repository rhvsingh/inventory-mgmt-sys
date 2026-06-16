"use client"

import { FileUp, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/lib/export"

interface ExportButtonProps<T extends object> {
    filename: string
    fetchData: () => Promise<T[]>
    label?: string
}

export function ExportButton<T extends object>({ filename, fetchData, label = "Export CSV" }: ExportButtonProps<T>) {
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        setExporting(true)
        try {
            const data = await fetchData()
            if (!data || data.length === 0) {
                toast.error("No data available to export.")
                return
            }

            // Sanitize database objects (remove complex relations or flatten them)
            const sanitized = data.map((item) => {
                const flat: Record<string, unknown> = {}
                for (const key of Object.keys(item)) {
                    const val = (item as Record<string, unknown>)[key]
                    if (val === null || val === undefined) {
                        flat[key] = ""
                    } else if (typeof val === "object") {
                        if (val instanceof Date) {
                            flat[key] = val.toISOString()
                        } else if ("name" in val && val.name) {
                            flat[key] = String((val as { name: unknown }).name)
                        } else {
                            flat[key] = JSON.stringify(val)
                        }
                    } else {
                        flat[key] = val
                    }
                }
                return flat
            })

            exportToCSV(sanitized, filename)
            toast.success("CSV file downloaded successfully!")
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Failed to export data.")
        } finally {
            setExporting(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto cursor-pointer"
            onClick={handleExport}
            disabled={exporting}
        >
            {exporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <FileUp className="h-4 w-4" />
                    {label}
                </>
            )}
        </Button>
    )
}
