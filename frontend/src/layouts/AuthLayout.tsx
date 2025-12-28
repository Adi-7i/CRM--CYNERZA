interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">CRM Pro</h1>
                    <p className="text-sm text-muted-foreground">Sign in to manage your business</p>
                </div>
                {children}
            </div>
        </div>
    );
}
