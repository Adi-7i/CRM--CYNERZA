"use client";

import { LeadsOverviewData } from "@/types/analytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LeadsOverviewChartProps {
    data: LeadsOverviewData[];
}

export function LeadsOverviewChart({ data }: LeadsOverviewChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorContacted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                    className="text-xs"
                    tick={{ fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                    }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="new"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorNew)"
                    name="New Leads"
                />
                <Area
                    type="monotone"
                    dataKey="contacted"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorContacted)"
                    name="Contacted"
                />
                <Area
                    type="monotone"
                    dataKey="qualified"
                    stroke="#ffc658"
                    fillOpacity={1}
                    fill="url(#colorQualified)"
                    name="Qualified"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
