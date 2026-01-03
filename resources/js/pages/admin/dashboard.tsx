import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Bot, CheckCircle, MessageSquare, Settings, Users, XCircle, Activity } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalCommands: number;
    activeCommands: number;
    botConfigured: boolean;
}

interface Props {
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
    },
];

const navigationCards = [
    {
        title: 'Bot Settings',
        description: 'Configure bot token, view status, and manage webhook',
        href: '/admin/bot-settings',
        icon: Settings,
    },
    {
        title: 'Commands',
        description: 'Manage bot commands and responses with buttons',
        href: '/admin/commands',
        icon: MessageSquare,
    },
    {
        title: 'Telegram Users',
        description: 'View and manage telegram users, block/unblock',
        href: '/admin/telegram-users',
        icon: Users,
    },
];

export default function AdminDashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8" />
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your Telegram bot settings, commands, and users from here.
                </p>

                {/* Quick Stats */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-6">
                    <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Quick Stats
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">Total Users</p>
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.activeUsers} active, {stats.blockedUsers} blocked
                            </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">Commands</p>
                                <MessageSquare className="h-4 w-4 text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold mt-2">{stats.totalCommands}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.activeCommands} active
                            </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">Active Users</p>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold mt-2">{stats.activeUsers}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Not blocked
                            </p>
                        </div>
                        <div className={`rounded-lg p-4 ${stats.botConfigured
                                ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20'
                                : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20'
                            }`}>
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">Bot Status</p>
                                {stats.botConfigured ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                            <p className={`text-xl font-bold mt-2 ${stats.botConfigured ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {stats.botConfigured ? 'Configured' : 'Not Configured'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.botConfigured ? 'Bot token is set' : 'Set bot token in settings'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {navigationCards.map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="border-sidebar-border/70 dark:border-sidebar-border group relative overflow-hidden rounded-xl border p-6 transition-all hover:bg-muted/50 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="mb-4">
                                <card.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">{card.title}</h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
