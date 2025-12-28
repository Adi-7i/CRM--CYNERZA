"use client";

import { SalesPerformanceData } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SalesPerformanceChartProps {
    data: SalesPerformanceData[];
}

export function SalesPerformanceChart({ data }: SalesPerformanceChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={100}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                    }}
                    formatter={(value, name) => {
                        if (value === undefined) return ['', ''];
                        if (name === 'revenue') {
                            return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                        }
                        if (name === 'conversion_rate') {
                            return [`${value}%`, 'Conversion Rate'];
                        }
                        return [value, String(name)];
                    }}
                />
                <Legend />
                <Bar dataKey="deals_won" fill="#8884d8" name="Deals Won" />
                <Bar dataKey="conversion_rate" fill="#82ca9d" name="Conversion Rate (%)" />
            </BarChart>
        </ResponsiveContainer>
    );
}
