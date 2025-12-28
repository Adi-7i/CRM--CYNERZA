"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    Contact,
    Briefcase,
    CheckSquare,
    Settings,
    Menu,
    LogOut,
    BarChart
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

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/customers", label: "Customers", icon: Contact },
    { href: "/deals", label: "Deals", icon: Briefcase },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/reports", label: "Reports", icon: BarChart },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen w-full">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-gradient-to-b from-gray-50 to-white sm:flex">
                <div className="flex h-16 items-center border-b px-6 bg-white">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            CRM Pro
                        </span>
                    </Link>
                </div>
                <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all relative group",
                                pathname === item.href
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {pathname === item.href && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-30" />
                            )}
                            <item.icon className={cn(
                                "h-5 w-5 relative z-10",
                                pathname === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                            )} />
                            <span className="relative z-10 font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs bg-gradient-to-b from-gray-50 to-white">
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
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-2.5 rounded-xl py-2 transition-all",
                                            pathname === item.href
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="ml-auto flex items-center gap-3">
                        <ThemeToggle />
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg dark:from-gray-800 dark:to-gray-800">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user?.name || 'User'}
                            </span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:ring-2 hover:ring-purple-500 hover:ring-offset-2 transition-all">
                                    <Avatar className="ring-2 ring-purple-100">
                                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                    {user?.role || 'user'}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Support</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6 md:p-8 bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
                    {children}
                </main>
            </div>
        </div>
    );
}
