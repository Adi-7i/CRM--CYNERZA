"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadStep } from "./steps/UploadStep";
import { MappingStep } from "./steps/MappingStep";
import { PreviewStep } from "./steps/PreviewStep";
import { DuplicatesStep } from "./steps/DuplicatesStep";
import { SummaryStep } from "./steps/SummaryStep";
import { UploadAnalysisResponse, MappingSubmission, ExecuteImportRequest } from "@/types/lead-import";

type WizardStep = 'upload' | 'mapping' | 'preview' | 'duplicates' | 'summary';

const STEPS: { id: WizardStep; label: string; number: number }[] = [
    { id: 'upload', label: 'Upload', number: 1 },
    { id: 'mapping', label: 'Mapping', number: 2 },
    { id: 'preview', label: 'Preview', number: 3 },
    { id: 'duplicates', label: 'Duplicates', number: 4 },
    { id: 'summary', label: 'Summary', number: 5 },
];

export function ImportWizard() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [analysisData, setAnalysisData] = useState<UploadAnalysisResponse | null>(null);

    const handleReset = () => {
        setCurrentStep('upload');
        setSessionId(null);
        setAnalysisData(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(handleReset, 300); // Reset after dialog closes
        }
    };

    const handleUploadComplete = (data: UploadAnalysisResponse) => {
        setSessionId(data.session_id);
        setAnalysisData(data);
        setCurrentStep('mapping');
    };

    const handleMappingComplete = () => {
        setCurrentStep('preview');
    };

    const handlePreviewComplete = () => {
        setCurrentStep('duplicates');
    };

    const handleDuplicatesComplete = () => {
        setCurrentStep('summary');
    };

    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    return (
        <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
                <Upload className="h-4 w-4" />
                Smart Import
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Smart Lead Import</DialogTitle>
                        <DialogDescription>
                            Import leads from CSV or Excel files with automatic field mapping and duplicate detection.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Stepper */}
                    <div className="flex items-center justify-between px-4 py-6 border-b">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors relative",
                                            index < currentStepIndex
                                                ? "bg-primary text-primary-foreground"
                                                : index === currentStepIndex
                                                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                                    : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {step.number}
                                        {index === currentStepIndex && (
                                            <Badge
                                                variant="secondary"
                                                className="absolute -top-2 -right-2 h-5 px-1.5 text-xs"
                                            >
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs mt-2 font-medium",
                                            index <= currentStepIndex
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "h-[2px] flex-1 mx-2 transition-colors",
                                            index < currentStepIndex ? "bg-primary" : "bg-muted"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {currentStep === 'upload' && (
                            <UploadStep onComplete={handleUploadComplete} />
                        )}
                        {currentStep === 'mapping' && sessionId && analysisData && (
                            <MappingStep
                                sessionId={sessionId}
                                analysisData={analysisData}
                                onComplete={handleMappingComplete}
                                onBack={() => setCurrentStep('upload')}
                            />
                        )}
                        {currentStep === 'preview' && sessionId && (
                            <PreviewStep
                                sessionId={sessionId}
                                onComplete={handlePreviewComplete}
                                onBack={() => setCurrentStep('mapping')}
                            />
                        )}
                        {currentStep === 'duplicates' && sessionId && (
                            <DuplicatesStep
                                sessionId={sessionId}
                                onComplete={handleDuplicatesComplete}
                                onBack={() => setCurrentStep('preview')}
                            />
                        )}
                        {currentStep === 'summary' && sessionId && (
                            <SummaryStep
                                sessionId={sessionId}
                                onClose={() => handleOpenChange(false)}
                                onRestart={handleReset}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
