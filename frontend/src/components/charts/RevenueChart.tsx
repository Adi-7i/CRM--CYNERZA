"use client";

import { RevenueData } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueChartProps {
    data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                    className="text-xs"
                    tick={{ fill: 'var(--muted-foreground)' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                    }}
                    formatter={(value) => value === undefined ? '' : `$${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" radius={[8, 8, 0, 0]} name="Actual Revenue" />
                <Bar dataKey="target" fill="#82ca9d" radius={[8, 8, 0, 0]} name="Target" />
            </BarChart>
        </ResponsiveContainer>
    );
}
