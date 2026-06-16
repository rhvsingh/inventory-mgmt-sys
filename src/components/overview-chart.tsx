"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface OverviewChartProps {
    data: {
        name: string
        total: number
    }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)" }}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    tick={{ fill: "var(--muted-foreground)" }}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-5}
                />
                <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-xl border bg-popover/95 p-3 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150 border-border/50">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
                                    <p className="text-sm font-bold text-foreground">
                                        Sales: <span className="text-primary font-extrabold">₹{payload[0].value}</span>
                                    </p>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                <Bar
                    dataKey="total"
                    fill="url(#colorTotal)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                    animationDuration={1000}
                    animationEasing="ease-out"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
