interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {action}
                {children}
            </div>
        </div>
    );
}
