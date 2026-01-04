"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    action?: ReactNode;
}

export function ChartCard({ title, description, children, action }: ChartCardProps) {
    return (
        <Card className="card-clean">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-sm">{description}</CardDescription>
                        )}
                    </div>
                    {action}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {children}
            </CardContent>
        </Card>
    );
}
