"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreateTask } from "@/hooks/useTasks";
import { Loader2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateTaskDialog() {
    const [open, setOpen] = useState(false);
    const createTask = useCreateTask();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assigned_to_id: 1,
        priority: "Medium",
        status: "Pending",
        due_date: "",
        related_type: "",
        related_id: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                title: formData.title,
                assigned_to_id: formData.assigned_to_id,
                priority: formData.priority,
                status: formData.status
            };

            if (formData.description) payload.description = formData.description;
            if (formData.due_date) payload.due_date = formData.due_date;
            if (formData.related_type) payload.related_type = formData.related_type;
            if (formData.related_id) payload.related_id = parseInt(formData.related_id);

            await createTask.mutateAsync(payload);
            setOpen(false);
            setFormData({
                title: "",
                description: "",
                assigned_to_id: 1,
                priority: "Medium",
                status: "Pending",
                due_date: "",
                related_type: "",
                related_id: ""
            });
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your workflow.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                placeholder="Follow up with client"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Add task details here..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="assigned_to_id">Assigned To (User ID)</Label>
                                <Input
                                    id="assigned_to_id"
                                    type="number"
                                    min="1"
                                    value={formData.assigned_to_id}
                                    onChange={(e) => setFormData({ ...formData, assigned_to_id: parseInt(e.target.value) || 1 })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="related_type">Related To</Label>
                                <Select
                                    value={formData.related_type}
                                    onValueChange={(val) => setFormData({ ...formData, related_type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        <SelectItem value="Lead">Lead</SelectItem>
                                        <SelectItem value="Customer">Customer</SelectItem>
                                        <SelectItem value="Deal">Deal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.related_type && (
                                <div className="grid gap-2">
                                    <Label htmlFor="related_id">{formData.related_type} ID</Label>
                                    <Input
                                        id="related_id"
                                        type="number"
                                        min="1"
                                        placeholder="Enter ID"
                                        value={formData.related_id}
                                        onChange={(e) => setFormData({ ...formData, related_id: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createTask.isPending}>
                            {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
