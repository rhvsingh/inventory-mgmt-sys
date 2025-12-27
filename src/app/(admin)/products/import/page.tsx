"use client"

import { AlertCircle, ArrowLeft, CheckCircle, FileSpreadsheet, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import Papa from "papaparse"
import { useState } from "react"
import { type ImportResult, importProducts } from "@/actions/import"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ImportProductsPage() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true)
        } else if (e.type === "dragleave") {
            setIsDragging(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
                setFile(droppedFile)
                setResult(null)
            } else {
                alert("Please upload a CSV file.")
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleUpload = () => {
        if (!file) return

        setLoading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const importResult = await importProducts(results.data)
                    setResult(importResult)
                } catch (error) {
                    console.error("Import failed:", error)
                    alert("Failed to import products. See console for details.")
                } finally {
                    setLoading(false)
                }
            },
            error: (error) => {
                console.error("CSV parse error:", error)
                setLoading(false)
                alert("Failed to parse CSV file.")
            },
        })
    }

    const downloadTemplate = () => {
        const csvContent =
            "sku,name,brand,category,costPrice,salePrice,stockQty,minStock,barcode\nPROD001,Example Product,BrandA,CategoryA,10.00,19.99,100,5,123456789"
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "product_import_template.csv"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
                <Link href="/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Import Products</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload CSV</CardTitle>
                    <CardDescription>
                        Bulk create or update products using a CSV file. Existing SKUs will be updated.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Need a template?</span>
                            <br />
                            Download a sample CSV file to get started.
                        </div>
                        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    {!result && (
                        // biome-ignore lint/a11y/useSemanticElements: Custom drag drop area requires div
                        <div
                            className={cn(
                                "flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-10 transition-colors w-full cursor-pointer",
                                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                                "hover:bg-muted/50"
                            )}
                            role="button"
                            tabIndex={0}
                            onClick={() => document.getElementById("file-upload")?.click()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    document.getElementById("file-upload")?.click()
                                }
                            }}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    Drag and drop your CSV file here, or{" "}
                                    <span className="text-primary hover:underline">browse</span>
                                </p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleChange}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB</p>
                            </div>
                            {file && (
                                <div className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-full text-sm">
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{file.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Processing import...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <Alert variant={result.failed === 0 ? "default" : "destructive"}>
                                {result.failed === 0 ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertTitle>Import Completed</AlertTitle>
                                <AlertDescription>
                                    Successfully imported {result.success} products. Failed: {result.failed}
                                </AlertDescription>
                            </Alert>

                            {result.errors.length > 0 && (
                                <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted px-4 py-2 border-b text-sm font-medium">Error Log</div>
                                    <div className="max-h-60 overflow-y-auto p-0">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 text-left">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Row</th>
                                                    <th className="px-4 py-2 font-medium">SKU</th>
                                                    <th className="px-4 py-2 font-medium">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.errors.map((err, i) => (
                                                    <tr
                                                        key={`${i}-${err.sku}`}
                                                        className="border-b last:border-0 hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-2">{err.row}</td>
                                                        <td className="px-4 py-2 font-mono text-xs">
                                                            {err.sku || "-"}
                                                        </td>
                                                        <td className="px-4 py-2 text-destructive">{err.error}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={() => {
                                    setFile(null)
                                    setResult(null)
                                }}
                            >
                                Import Another File
                            </Button>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="flex justify-end gap-2">
                            <Link href="/products">
                                <Button variant="ghost">Cancel</Button>
                            </Link>
                            <Button onClick={handleUpload} disabled={!file}>
                                Import
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
