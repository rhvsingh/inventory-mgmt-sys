/**
 * Standard utility to export an array of key-value objects into a downloadable CSV file.
 * Handles escaping of commas, quotes, and newlines in compliance with RFC 4180.
 *
 * @param data Array of objects representing the rows.
 * @param filename Desired name of the exported file (excluding extension).
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = []

    // 1. Add headers row
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","))

    // 2. Add data rows
    for (const row of data) {
        const values = headers.map((header) => {
            const val = row[header]
            let displayVal = ""

            if (val === null || val === undefined) {
                displayVal = ""
            } else if (typeof val === "object") {
                if (val instanceof Date) {
                    displayVal = val.toISOString()
                } else {
                    displayVal = JSON.stringify(val)
                }
            } else {
                displayVal = String(val)
            }

            // Escape double quotes by doubling them
            const escaped = displayVal.replace(/"/g, '""')
            return `"${escaped}"`
        })
        csvRows.push(values.join(","))
    }

    const csvString = csvRows.join("\r\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
