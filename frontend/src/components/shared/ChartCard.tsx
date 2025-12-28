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
        <Card className="border-0 shadow-lg hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="mt-1.5">{description}</CardDescription>
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
