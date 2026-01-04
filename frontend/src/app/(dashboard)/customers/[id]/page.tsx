"use client";

import { useParams, useRouter } from "next/navigation";
import { useCustomer, useCustomerInteractions, useAddInteraction, useDeleteCustomer } from "@/hooks/useCustomers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
    Building,
    MessageSquare,
    Trash2,
    PhoneCall,
    Video,
    FileText,
    Send,
} from "lucide-react";
import { useState } from "react";
import { InteractionType } from "@/types/customers";
import { formatDistanceToNow } from "date-fns";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

const interactionTypeIcons: Record<InteractionType, typeof PhoneCall> = {
    "Call": PhoneCall,
    "Email": Mail,
    "Meeting": Video,
    "Note": FileText,
};

const interactionTypeColors: Record<InteractionType, string> = {
    "Call": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Email": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Meeting": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Note": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const interactionTypes: InteractionType[] = ["Call", "Email", "Meeting", "Note"];

function CustomerDetailSkeleton() {
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = Number(params.id);

    const { data: customer, isLoading: customerLoading, isError } = useCustomer(customerId);
    const { data: interactions, isLoading: interactionsLoading } = useCustomerInteractions(customerId);
    const addInteraction = useAddInteraction();
    const deleteCustomer = useDeleteCustomer();

    const [interactionType, setInteractionType] = useState<InteractionType>("Note");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const handleAddInteraction = () => {
        if (!description.trim()) return;
        addInteraction.mutate(
            {
                customerId,
                data: {
                    interaction_type: interactionType,
                    subject: subject || undefined,
                    description,
                },
            },
            {
                onSuccess: () => {
                    setSubject("");
                    setDescription("");
                },
            }
        );
    };

    const handleDelete = () => {
        deleteCustomer.mutate(customerId, {
            onSuccess: () => router.push("/customers"),
        });
    };

    if (customerLoading) {
        return <CustomerDetailSkeleton />;
    }

    if (isError || !customer) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">Customer not found or you don't have permission to view it.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{customer.full_name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {customer.company || customer.email}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <PermissionGuard permission="customers:delete">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this customer? This action cannot be undone.
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
                {/* Customer Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm font-medium">{customer.phone || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Company</p>
                                        <p className="text-sm font-medium">{customer.company || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Customer Since</p>
                                        <p className="text-sm font-medium">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {customer.assigned_to && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Account Manager</p>
                                            <p className="text-sm font-medium">{customer.assigned_to.full_name}</p>
                                        </div>
                                    </div>
                                )}
                                {customer.lead && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Converted From Lead</p>
                                            <p className="text-sm font-medium">{customer.lead.full_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interactions Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Interactions
                            </CardTitle>
                            <CardDescription>
                                Track calls, emails, meetings, and notes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Interaction Form */}
                            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Select
                                        value={interactionType}
                                        onValueChange={(value) => setInteractionType(value as InteractionType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {interactionTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Subject (optional)"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                <Textarea
                                    placeholder="Describe the interaction..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                                <Button
                                    onClick={handleAddInteraction}
                                    disabled={!description.trim() || addInteraction.isPending}
                                    size="sm"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {addInteraction.isPending ? "Adding..." : "Add Interaction"}
                                </Button>
                            </div>

                            <Separator />

                            {/* Interactions List */}
                            {interactionsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-16 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : interactions && interactions.length > 0 ? (
                                <div className="space-y-4">
                                    {interactions.map((interaction) => {
                                        const Icon = interactionTypeIcons[interaction.interaction_type];
                                        return (
                                            <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            className={interactionTypeColors[interaction.interaction_type]}
                                                            variant="secondary"
                                                        >
                                                            <Icon className="h-3 w-3 mr-1" />
                                                            {interaction.interaction_type}
                                                        </Badge>
                                                        {interaction.subject && (
                                                            <span className="font-medium text-sm">{interaction.subject}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {interaction.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {interaction.user.full_name}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No interactions yet. Add one above!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Interactions</span>
                                <span className="font-medium">{interactions?.length || 0}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Last Updated</span>
                                <span className="text-sm">
                                    {formatDistanceToNow(new Date(customer.updated_at), { addSuffix: true })}
                                </span>
                            </div>
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
                                        <p className="font-medium">Customer Updated</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(customer.updated_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Customer Created</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
