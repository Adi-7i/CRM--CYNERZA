"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Contact,
    Briefcase,
    CheckSquare,
    Settings,
    Menu,
    LogOut,
    BarChart,
    UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/config/permissions";
import { toast } from "sonner";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    href: string;
    label: string;
    icon: any;
    permission: Permission;
}

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "nav:dashboard" },
    { href: "/leads", label: "Leads", icon: Users, permission: "nav:leads" },
    { href: "/customers", label: "Customers", icon: Contact, permission: "nav:customers" },
    { href: "/deals", label: "Deals", icon: Briefcase, permission: "nav:deals" },
    { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: "nav:tasks" },
    { href: "/reports", label: "Reports", icon: BarChart, permission: "nav:reports" },
    { href: "/users", label: "Users", icon: UserCog, permission: "nav:users" },
    { href: "/settings", label: "Settings", icon: Settings, permission: "nav:settings" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { can, canAccessRoute } = usePermission();

    // Filter navigation items based on user permissions
    const filteredNavItems = navItems.filter(item => can(item.permission));

    // Route protection - redirect if user tries to access restricted page
    useEffect(() => {
        if (user && !canAccessRoute(pathname)) {
            toast.error("You don't have permission to access that page");
            router.push('/dashboard');
        }
    }, [pathname, user, canAccessRoute, router]);

    const handleLogout = () => {
        logout();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'manager': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'sales': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 sm:flex shadow-xl overflow-y-auto sticky top-0 h-screen">
                <div className="flex h-16 items-center border-b px-6 bg-white dark:bg-gray-900">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            CRM Pro
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all relative group",
                                pathname === item.href
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {pathname === item.href && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-30" />
                            )}
                            <item.icon className={cn(
                                "h-5 w-5 relative z-10",
                                pathname === item.href ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white"
                            )} />
                            <span className="relative z-10 font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User info at bottom of sidebar */}
                {user && (
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3 px-2">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full", getRoleBadgeColor(user.role))}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <nav className="grid gap-6 text-lg font-medium mt-6">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 font-semibold"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold">C</span>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        CRM Pro
                                    </span>
                                </Link>
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-2.5 rounded-xl py-2 transition-all",
                                            pathname === item.href
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="flex flex-1 items-center justify-end gap-4">
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={user?.name || ""} />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full w-fit mt-1", getRoleBadgeColor(user?.role || ''))}>
                                            {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
