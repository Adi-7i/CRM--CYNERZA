export function ChartSkeleton() {
    return (
        <div className="h-[300px] w-full animate-pulse">
            <div className="h-full w-full bg-muted rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
            </div>
        </div>
    );
}
