"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileUp, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLeadImport } from "@/hooks/useLeads";
import { LeadImportResponse } from "@/types/leads";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SAMPLE_CSV_CONTENT = `full_name,email,phone,source
John Doe,john@example.com,+1234567890,Website
Jane Smith,jane@company.com,+1987654321,Referral
Acme Corp,contact@acme.com,,Direct`;

export function LeadImportDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<LeadImportResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: importLeads, isPending, error, reset } = useLeadImport();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            reset();
        }
    };

    const handleUpload = () => {
        if (!file) return;
        importLeads(file, {
            onSuccess: (data) => {
                setResult(data);
                setFile(null); // Clear file to prevent double upload
            },
        });
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_leads.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setOpen(false);
        setFile(null);
        setResult(null);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Leads</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to import leads in bulk.
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Template File</h4>
                                <p className="text-xs text-muted-foreground">
                                    Download a sample CSV file to get started.
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="file">Lead File</Label>
                            <Input
                                ref={fileInputRef}
                                id="file"
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Supported formats: .csv, .xlsx. Max size: 5MB.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {(error as any)?.response?.data?.detail || "Failed to upload file."}
                                </AlertDescription>
                            </Alert>
                        )}

                        {isPending && (
                            <div className="space-y-2">
                                <Label>Uploading...</Label>
                                <Progress value={undefined} className="w-full" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center justify-center space-y-2 p-6 border rounded-lg bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <h3 className="font-medium text-lg">Import Complete</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Processed {result.total_rows} rows from your file.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-muted rounded-md">
                                <span className="block text-2xl font-bold">{result.inserted}</span>
                                <span className="text-xs text-muted-foreground">Added</span>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <span className="block text-2xl font-bold">{result.skipped_duplicates}</span>
                                <span className="text-xs text-muted-foreground">Skipped</span>
                            </div>
                            <div className={cn("p-3 rounded-md", result.error_count > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-muted")}>
                                <span className={cn("block text-2xl font-bold", result.error_count > 0 && "text-red-500")}>
                                    {result.error_count}
                                </span>
                                <span className="text-xs text-muted-foreground">Errors</span>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="rounded-md border p-4 max-h-[200px] overflow-y-auto bg-muted/30">
                                <h4 className="text-sm font-medium mb-2 flex items-center text-red-500">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Import Issues
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="text-muted-foreground border-b pb-2 last:border-0 last:pb-0">
                                            <span className="font-medium text-foreground">Row {err.row}: </span>
                                            {err.field && <span className="italic">{err.field} - </span>}
                                            {err.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!result ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleUpload} disabled={!file || isPending}>
                                {isPending ? (
                                    <>
                                        <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload & Import
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose}>Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
