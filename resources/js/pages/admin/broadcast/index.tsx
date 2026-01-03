import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, Loader2, Plus, Send, XCircle } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';

interface BroadcastMessage {
    id: number;
    message: string;
    media_type: string;
    recipient_type: 'all' | 'selected';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    progress: number;
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
}

interface Props {
    broadcasts: {
        data: BroadcastMessage[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Send Message', href: '/admin/broadcast' },
];

const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', animate: true },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

// Strip HTML and Markdown formatting for display in list
const stripFormatting = (text: string): string => {
    return text
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove Markdown bold/italic
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove Markdown code
        .replace(/`(.*?)`/g, '$1')
        // Remove Markdown links, keep text
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();
};

export default function BroadcastIndex({ broadcasts, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send Message" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Send className="h-8 w-8" />
                        <h1 className="text-2xl font-bold">Send Message</h1>
                    </div>
                    <Link href="/admin/broadcast/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Broadcast
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Total Broadcasts</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Pending</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Processing</p>
                            <p className="text-3xl font-bold">{stats.processing}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Completed</p>
                            <p className="text-3xl font-bold">{stats.completed}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Broadcast List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Broadcast History</CardTitle>
                        <CardDescription>View all your broadcast messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {broadcasts.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No broadcasts yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {broadcasts.data.map((broadcast) => {
                                    const StatusIcon = statusConfig[broadcast.status].icon;
                                    const config = statusConfig[broadcast.status];

                                    return (
                                        <Link
                                            key={broadcast.id}
                                            href={`/admin/broadcast/${broadcast.id}`}
                                            className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate max-w-md">
                                                        {(() => {
                                                            const cleanText = stripFormatting(broadcast.message);
                                                            return cleanText.length > 80
                                                                ? cleanText.substring(0, 80) + '...'
                                                                : cleanText;
                                                        })()}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span>{broadcast.recipient_type === 'all' ? 'All users' : 'Selected users'}</span>
                                                        <span>•</span>
                                                        <span>{broadcast.total_recipients} recipients</span>
                                                        <span>•</span>
                                                        <span>{new Date(broadcast.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {broadcast.status === 'processing' && (
                                                        <div className="w-24">
                                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 transition-all"
                                                                    style={{ width: `${broadcast.progress}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-center mt-1">{broadcast.progress}%</p>
                                                        </div>
                                                    )}
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                                                        <StatusIcon className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                                                        <span className={`text-sm font-medium capitalize ${config.color}`}>
                                                            {broadcast.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
