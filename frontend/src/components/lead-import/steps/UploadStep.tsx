"use client";

import { useState, useCallback } from "react";
import { Upload as UploadIcon, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUploadFile } from "@/hooks/useLeadImport";
import { UploadAnalysisResponse } from "@/types/lead-import";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadStepProps {
    onComplete: (data: UploadAnalysisResponse) => void;
}

export function UploadStep({ onComplete }: UploadStepProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const { mutate: uploadFile, isPending, error } = useUploadFile();

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!validTypes.includes(selectedFile.type) &&
            !selectedFile.name.endsWith('.csv') &&
            !selectedFile.name.endsWith('.xlsx')) {
            toast.error('Invalid file type. Please upload a CSV or Excel file.');
            alert('Please upload a CSV or Excel file');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            alert('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        toast.success(`File selected: ${selectedFile.name}`);
    };

    const handleUpload = () => {
        if (!file) return;

        uploadFile(file, {
            onSuccess: (data) => {
                toast.success('File analyzed successfully!');
                onComplete(data);
            },
        });
    };

    return (
        <div className="space-y-content">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Upload Lead File</h3>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV or Excel file containing your leads. We'll analyze the columns and help you map them.
                </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50",
                    isPending && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <FileSpreadsheet className="h-10 w-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            {file ? file.name : "Drag and drop your file here"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            or click to browse
                        </p>
                    </div>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileSelect(e.target.files[0]);
                            }
                        }}
                        disabled={isPending}
                    />

                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isPending}
                    >
                        Select File
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, XLSX • Max size: 5MB
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Upload Failed</AlertTitle>
                    <AlertDescription>
                        {(error as any)?.response?.data?.detail || "Failed to upload file. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            {file && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <UploadIcon className="mr-2 h-4 w-4 animate-bounce" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <UploadIcon className="mr-2 h-4 w-4" />
                                Analyze File
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
