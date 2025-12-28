"use client";

import { DealPipelineData } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DealPipelineChartProps {
    data: DealPipelineData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DealPipelineChart({ data }: DealPipelineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="stage"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                    }}
                    formatter={(value, name) => {
                        if (value === undefined) return ['', ''];
                        if (name === 'value') {
                            return [`$${Number(value).toLocaleString()}`, 'Deal Value'];
                        }
                        return [value, name === 'count' ? 'Deals' : String(name)];
                    }}
                />
                <Bar dataKey="count" name="count" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
