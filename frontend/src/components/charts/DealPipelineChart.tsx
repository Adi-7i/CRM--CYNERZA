"use client";

import { DealPipelineData } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DealPipelineChartProps {
    data: DealPipelineData[];
}

// Stage-specific colors for better visual distinction
const STAGE_COLORS: Record<string, string> = {
    'Prospecting': '#3b82f6',      // Blue
    'Qualification': '#8b5cf6',    // Purple
    'Proposal': '#10b981',          // Green
    'Negotiation': '#f59e0b',       // Amber
    'Closed Won': '#22c55e',        // Success green
    'Closed Lost': '#ef4444'        // Red
};

export function DealPipelineChart({ data }: DealPipelineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="stage"
                    className="text-xs"
                    tick={{ fill: 'var(--muted-foreground)' }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
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
                        <Cell
                            key={`cell-${index}`}
                            fill={STAGE_COLORS[entry.stage] || '#6366f1'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
