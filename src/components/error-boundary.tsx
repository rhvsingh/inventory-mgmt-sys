"use client"

import { AlertCircle, Home, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function GenericErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error("ErrorBoundary caught an error:", error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Card className="w-full max-w-md border-destructive/30 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Something went wrong!</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        An unexpected error occurred while loading this section.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="rounded-lg bg-muted p-4 text-left font-mono text-xs overflow-auto max-h-40 break-all text-muted-foreground border">
                        {error.message || "Unknown error"}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => reset()}>
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button className="w-full gap-2">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
