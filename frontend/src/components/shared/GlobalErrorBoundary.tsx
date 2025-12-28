"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="p-4 bg-red-50 rounded-full mb-4 dark:bg-red-900/20">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Something went wrong</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                {error.message || "An unexpected error occurred while rendering this component."}
            </p>
            <Button onClick={resetErrorBoundary}>Try again</Button>
        </div>
    );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset the state of your app so the error doesn't happen again
                window.location.reload();
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
