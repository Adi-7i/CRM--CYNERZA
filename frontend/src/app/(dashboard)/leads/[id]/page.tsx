"use client";

import { useParams, useRouter } from "next/navigation";
import { useLead, useLeadNotes, useAddLeadNote, useUpdateLeadStatus, useDeleteLead } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Mail,
    Phone,
    User,
    Calendar,
    Tag,
    MessageSquare,
    Trash2,
    UserPlus,
    Send,
} from "lucide-react";
import { useState } from "react";
import { LeadStatus } from "@/types/leads";
import { formatDistanceToNow } from "date-fns";
import { ConvertLeadDialog } from "../convert-lead-dialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

const statusColors: Record<string, string> = {
    "New": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Contacted": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Qualified": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Proposal": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Won": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    "Lost": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const sourceColors: Record<string, string> = {
    "Website": "bg-indigo-100 text-indigo-800",
    "Referral": "bg-pink-100 text-pink-800",
    "Campaign": "bg-orange-100 text-orange-800",
    "Direct": "bg-teal-100 text-teal-800",
    "Other": "bg-gray-100 text-gray-800",
};

const allStatuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

function LeadDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = Number(params.id);

    const { data: lead, isLoading: leadLoading, isError } = useLead(leadId);
    const { data: notes, isLoading: notesLoading } = useLeadNotes(leadId);
    const addNote = useAddLeadNote();
    const updateStatus = useUpdateLeadStatus();
    const deleteLead = useDeleteLead();

    const [noteText, setNoteText] = useState("");
    const [convertOpen, setConvertOpen] = useState(false);

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNote.mutate({ leadId, note_text: noteText }, {
            onSuccess: () => setNoteText(""),
        });
    };

    const handleStatusChange = (newStatus: string) => {
        updateStatus.mutate({ id: leadId, status: newStatus });
    };

    const handleDelete = () => {
        deleteLead.mutate(leadId, {
            onSuccess: () => router.push("/leads"),
        });
    };

    if (leadLoading) {
        return <LeadDetailSkeleton />;
    }

    if (isError || !lead) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">Lead not found or you don't have permission to view it.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const canConvert = lead.status !== "Won" && lead.status !== "Lost";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{lead.full_name}</h1>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <PermissionGuard permission="leads:convert">
                        {canConvert && (
                            <Button variant="outline" onClick={() => setConvertOpen(true)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Convert to Customer
                            </Button>
                        )}
                    </PermissionGuard>
                    <PermissionGuard permission="leads:delete">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this lead? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </PermissionGuard>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Lead Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{lead.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm font-medium">{lead.phone || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Source</p>
                                        <Badge className={sourceColors[lead.source]} variant="secondary">
                                            {lead.source}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm font-medium">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {lead.assigned_to && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Assigned To</p>
                                            <p className="text-sm font-medium">{lead.assigned_to.full_name}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.created_by && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Created By</p>
                                            <p className="text-sm font-medium">{lead.created_by.full_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Notes
                            </CardTitle>
                            <CardDescription>
                                Add notes to track interactions and activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Note Form */}
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Add a note about this lead..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    rows={3}
                                />
                                <Button
                                    onClick={handleAddNote}
                                    disabled={!noteText.trim() || addNote.isPending}
                                    size="sm"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {addNote.isPending ? "Adding..." : "Add Note"}
                                </Button>
                            </div>

                            <Separator />

                            {/* Notes List */}
                            {notesLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-16 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : notes && notes.length > 0 ? (
                                <div className="space-y-4">
                                    {notes.map((note) => (
                                        <div key={note.id} className="border rounded-lg p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{note.user.full_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {note.note_text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No notes yet. Add one above!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Status & Actions Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Current:</span>
                                <Badge className={statusColors[lead.status]}>
                                    {lead.status}
                                </Badge>
                            </div>
                            <PermissionGuard permission="leads:edit">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Change Status</label>
                                    <Select
                                        value={lead.status}
                                        onValueChange={handleStatusChange}
                                        disabled={updateStatus.isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allStatuses.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </PermissionGuard>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 text-sm">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                                    <div>
                                        <p className="font-medium">Lead Updated</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Lead Created</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Convert Lead Dialog */}
            <ConvertLeadDialog lead={lead} open={convertOpen} onOpenChange={setConvertOpen} />
        </div>
    );
}
