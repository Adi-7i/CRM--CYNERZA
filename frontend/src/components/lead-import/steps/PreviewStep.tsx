"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useImportPreview } from "@/hooks/useLeadImport";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewStepProps {
    sessionId: number;
    onComplete: () => void;
    onBack: () => void;
}

export function PreviewStep({ sessionId, onComplete, onBack }: PreviewStepProps) {
    const { data: preview, isLoading } = useImportPreview(sessionId);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!preview) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load preview data</AlertDescription>
            </Alert>
        );
    }

    const hasErrors = preview.invalid_count > 0;

    return (
        <div className="space-y-content">
            <div>
                <h3 className="text-lg font-semibold">Preview Normalized Data</h3>
                <p className="text-sm text-muted-foreground">
                    Review the normalized data before proceeding to duplicate detection
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Valid Rows</span>
                    </div>
                    <div className="text-2xl font-bold">{preview.valid_rows}</div>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Invalid Rows</span>
                    </div>
                    <div className="text-2xl font-bold">{preview.invalid_count}</div>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Total Rows</span>
                    </div>
                    <div className="text-2xl font-bold">{preview.total_rows}</div>
                </div>
            </div>

            {/* Validation Errors */}
            {hasErrors && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors Found</AlertTitle>
                    <AlertDescription>
                        {preview.invalid_count} rows have validation errors. These rows will be skipped during import.
                    </AlertDescription>
                </Alert>
            )}

            {preview.validation_errors.length > 0 && (
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-medium mb-3">Error Details</h4>
                    <div className="space-y-2">
                        {preview.validation_errors.slice(0, 10).map((error, idx) => (
                            <div key={idx} className="text-sm flex gap-2">
                                <span className="font-medium text-red-500">Row {error.row}:</span>
                                <span className="text-muted-foreground">{error.field} - {error.error}</span>
                            </div>
                        ))}
                        {preview.validation_errors.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                                ... and {preview.validation_errors.length - 10} more errors
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Sample Data Preview */}
            <div>
                <h4 className="font-medium mb-3">Sample Normalized Data</h4>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Source</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {preview.sample_normalized.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.full_name}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.phone || '-'}</TableCell>
                                    <TableCell>{row.source || 'Other'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    Back to Mapping
                </Button>
                <Button onClick={onComplete}>
                    Continue to Duplicates
                </Button>
            </div>
        </div>
    );
}
