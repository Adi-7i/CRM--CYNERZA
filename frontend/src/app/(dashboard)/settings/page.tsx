import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator />
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                Settings forms will go here.
            </div>
        </div>
    );
}
