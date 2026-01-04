"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                    <p className="text-muted-foreground">
                        View and manage your scheduled activities
                    </p>
                </div>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                {currentMonth} {currentYear}
                            </CardTitle>
                            <CardDescription>Schedule and upcoming events</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToPreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentDate(new Date())}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Calendar View Coming Soon</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            The calendar feature is currently under development.
                            You'll be able to view and manage all your scheduled tasks,
                            meetings, and events here.
                        </p>
                        <div className="mt-6 grid gap-2 w-full max-w-md">
                            <Card className="border-indigo-200 dark:border-indigo-900">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">Planned Features</span>
                                                <Badge variant="secondary" className="text-xs">Soon</Badge>
                                            </div>
                                            <ul className="text-xs text-muted-foreground text-left space-y-1">
                                                <li>• Monthly, weekly, and daily views</li>
                                                <li>• Task and meeting scheduling</li>
                                                <li>• Event reminders and notifications</li>
                                                <li>• Integration with Tasks module</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
