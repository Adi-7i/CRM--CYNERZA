"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Users } from "lucide-react";
import { useImportDuplicates, useExecuteImport } from "@/hooks/useLeadImport";
import { Skeleton } from "@/components/ui/skeleton";
import { DuplicateAction } from "@/types/lead-import";
import { toast } from "sonner";

interface DuplicatesStepProps {
    sessionId: number;
    onComplete: () => void;
    onBack: () => void;
}

export function DuplicatesStep({ sessionId, onComplete, onBack }: DuplicatesStepProps) {
    const { data: duplicates, isLoading } = useImportDuplicates(sessionId);
    const { mutate: executeImport, isPending } = useExecuteImport();

    const [decisions, setDecisions] = useState<Record<string, DuplicateAction>>({});

    const handleDecision = (rowNum: string, action: DuplicateAction) => {
        setDecisions(prev => ({ ...prev, [rowNum]: action }));
    };

    const handleBulkAction = (action: DuplicateAction) => {
        const allRows: Record<string, DuplicateAction> = {};

        duplicates?.existing_duplicates.forEach(dup => {
            allRows[String(dup.import_row)] = action;
        });

        duplicates?.smart_matches.forEach(match => {
            allRows[String(match.import_row)] = action;
        });

        setDecisions(allRows);
        toast.success(`All duplicates set to: ${action}`);
    };

    const handleExecute = () => {
        executeImport({
            sessionId,
            request: { duplicate_decisions: decisions }
        }, {
            onSuccess: () => {
                onComplete();
            }
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!duplicates) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load duplicate data</AlertDescription>
            </Alert>
        );
    }

    const hasDuplicates = duplicates.total_duplicates > 0;

    return (
        <div className="space-y-content">
            <div>
                <h3 className="text-lg font-semibold">Resolve Duplicates</h3>
                <p className="text-sm text-muted-foreground">
                    Review and decide how to handle duplicate leads
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium">In-File Duplicates</span>
                    </div>
                    <div className="text-2xl font-bold">{duplicates.in_file_duplicates.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">First occurrence will be kept</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Existing Duplicates</span>
                    </div>
                    <div className="text-2xl font-bold">{duplicates.existing_duplicates.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Exact matches in database</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Smart Matches</span>
                    </div>
                    <div className="text-2xl font-bold">{duplicates.smart_matches.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Similar leads found</p>
                </div>
            </div>

            {!hasDuplicates ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Duplicates Found</AlertTitle>
                    <AlertDescription>
                        All leads are unique. You can proceed with the import.
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    {/* Bulk Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkAction('skip')}
                            disabled={isPending}
                        >
                            Skip All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkAction('update')}
                            disabled={isPending}
                        >
                            Update All
                        </Button>
                    </div>

                    {/* Existing Duplicates */}
                    {duplicates.existing_duplicates.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium">Existing Duplicates</h4>
                            <div className="space-y-3">
                                {duplicates.existing_duplicates.map((dup, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">Row {dup.import_row}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Matches existing lead: {dup.existing_lead.full_name} ({dup.existing_lead.email})
                                                </p>
                                            </div>
                                            <Select
                                                value={decisions[String(dup.import_row)] || 'skip'}
                                                onValueChange={(value) => handleDecision(String(dup.import_row), value as DuplicateAction)}
                                                disabled={isPending}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="skip">Skip</SelectItem>
                                                    <SelectItem value="update">Update</SelectItem>
                                                    <SelectItem value="create">Create New</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground mb-1">Import Data:</p>
                                                <p>{dup.import_data.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{dup.import_data.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground mb-1">Existing Lead:</p>
                                                <p>{dup.existing_lead.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{dup.existing_lead.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In-File Duplicates Info */}
                    {duplicates.in_file_duplicates.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>In-File Duplicates</AlertTitle>
                            <AlertDescription>
                                {duplicates.in_file_duplicates.length} duplicate(s) found within the file.
                                Only the first occurrence will be imported.
                            </AlertDescription>
                        </Alert>
                    )}
                </>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isPending}>
                    Back to Preview
                </Button>
                <Button onClick={handleExecute} disabled={isPending}>
                    {isPending ? "Importing..." : "Execute Import"}
                </Button>
            </div>
        </div>
    );
}
