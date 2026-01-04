"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Download, RefreshCw } from "lucide-react";
import { useImportSession } from "@/hooks/useLeadImport";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryStepProps {
    sessionId: number;
    onClose: () => void;
    onRestart: () => void;
}

export function SummaryStep({ sessionId, onClose, onRestart }: SummaryStepProps) {
    const { data: session, isLoading } = useImportSession(sessionId);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!session) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load import summary</AlertDescription>
            </Alert>
        );
    }

    const isCompleted = session.status === 'completed';
    const hasFailed = session.status === 'failed';

    return (
        <div className="space-y-content">
            {isCompleted ? (
                <>
                    {/* Success Animation */}
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-full">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold">Import Completed!</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Your leads have been successfully imported into the CRM system.
                        </p>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                            <div className="text-3xl font-bold text-green-500">{session.valid_rows || 0}</div>
                            <div className="text-sm text-muted-foreground mt-1">Inserted</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <div className="text-3xl font-bold text-blue-500">0</div>
                            <div className="text-sm text-muted-foreground mt-1">Updated</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {(session.total_rows || 0) - (session.valid_rows || 0)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Skipped</div>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <div className="text-3xl font-bold text-red-500">0</div>
                            <div className="text-sm text-muted-foreground mt-1">Errors</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button variant="outline" onClick={onRestart} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Import Another File
                        </Button>
                        <Button onClick={onClose} className="flex-1">
                            Done
                        </Button>
                    </div>
                </>
            ) : hasFailed ? (
                <>
                    <Alert variant="destructive">
                        <AlertTitle>Import Failed</AlertTitle>
                        <AlertDescription>
                            {session.error_message || "An error occurred during the import process."}
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onRestart} className="flex-1">
                            Try Again
                        </Button>
                        <Button onClick={onClose} className="flex-1">
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Processing import...</p>
                </div>
            )}
        </div>
    );
}
