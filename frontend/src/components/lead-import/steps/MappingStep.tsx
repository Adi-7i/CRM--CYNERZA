"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Save, AlertCircle, Merge } from "lucide-react";
import { useSubmitMapping } from "@/hooks/useLeadImport";
import { UploadAnalysisResponse, MergeRule } from "@/types/lead-import";
import { toast } from "sonner";

interface MappingStepProps {
    sessionId: number;
    analysisData: UploadAnalysisResponse;
    onComplete: () => void;
    onBack: () => void;
}

export function MappingStep({ sessionId, analysisData, onComplete, onBack }: MappingStepProps) {
    const [mappings, setMappings] = useState<Record<string, string>>(
        analysisData.suggested_mappings || {}
    );
    const [mergeRules, setMergeRules] = useState<MergeRule[]>([]);
    const [ignoredColumns, setIgnoredColumns] = useState<string[]>([]);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState("");

    const { mutate: submitMapping, isPending } = useSubmitMapping();

    const handleMappingChange = (sourceColumn: string, targetField: string) => {
        setMappings(prev => ({
            ...prev,
            [sourceColumn]: targetField
        }));
    };

    const handleIgnoreToggle = (column: string, ignored: boolean) => {
        if (ignored) {
            setIgnoredColumns(prev => [...prev, column]);
            // Remove from mappings
            setMappings(prev => {
                const newMappings = { ...prev };
                delete newMappings[column];
                return newMappings;
            });
        } else {
            setIgnoredColumns(prev => prev.filter(c => c !== column));
        }
    };

    const handleAddMergeRule = () => {
        const newRule: MergeRule = {
            source_columns: [],
            target_field: "",
            separator: " "
        };
        setMergeRules(prev => [...prev, newRule]);
    };

    const handleSubmit = () => {
        // Validate required fields
        const requiredFields = ['full_name', 'email'];
        const mappedFields = Object.values(mappings);
        const missingFields = requiredFields.filter(f => !mappedFields.includes(f));

        if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        submitMapping({
            sessionId,
            mappingData: {
                mappings,
                merge_rules: mergeRules,
                ignored_columns: ignoredColumns,
                save_as_template: saveAsTemplate,
                template_name: saveAsTemplate ? templateName : undefined,
            }
        }, {
            onSuccess: () => {
                toast.success('Mapping saved successfully');
                onComplete();
            }
        });
    };

    return (
        <div className="space-y-content">
            <div>
                <h3 className="text-lg font-semibold">Map Columns</h3>
                <p className="text-sm text-muted-foreground">
                    Map your file columns to CRM fields. Required fields: Full Name, Email
                </p>
            </div>

            {/* Mapping Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 font-medium text-sm">
                    <div className="col-span-5">Your Column</div>
                    <div className="col-span-1"></div>
                    <div className="col-span-5">CRM Field</div>
                    <div className="col-span-1">Ignore</div>
                </div>

                <div className="divide-y">
                    {analysisData.detected_columns.map((column) => {
                        const isIgnored = ignoredColumns.includes(column);
                        const mappedField = mappings[column] || "";

                        return (
                            <div key={column} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5">
                                    <div className="font-medium text-sm">{column}</div>
                                    {analysisData.sample_rows[0]?.[column] && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            e.g., {String(analysisData.sample_rows[0][column]).substring(0, 30)}...
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="col-span-5">
                                    <Select
                                        value={mappedField}
                                        onValueChange={(value) => handleMappingChange(column, value)}
                                        disabled={isIgnored || isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select field..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {analysisData.available_crm_fields.map((field) => (
                                                <SelectItem key={field} value={field}>
                                                    {field}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <Checkbox
                                        checked={isIgnored}
                                        onCheckedChange={(checked) => handleIgnoreToggle(column, checked as boolean)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Merge Rules Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Merge Rules (Optional)</Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddMergeRule}
                        disabled={isPending}
                    >
                        <Merge className="h-4 w-4 mr-2" />
                        Add Merge Rule
                    </Button>
                </div>

                {mergeRules.length > 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Merge rules allow you to combine multiple columns (e.g., First Name + Last Name → Full Name)
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Template Save */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="save-template"
                        checked={saveAsTemplate}
                        onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                        disabled={isPending}
                    />
                    <Label htmlFor="save-template" className="cursor-pointer">
                        Save as template for future imports
                    </Label>
                </div>

                {saveAsTemplate && (
                    <Input
                        placeholder="Template name (e.g., 'Standard Lead Import')"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        disabled={isPending}
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isPending}>
                    Back
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? "Processing..." : "Continue to Preview"}
                </Button>
            </div>
        </div>
    );
}
