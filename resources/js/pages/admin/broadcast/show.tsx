import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Code, FileAudio, FileText, FileVideo, Image, Loader2, Mic, RefreshCw, Send, Type, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { BreadcrumbItem } from '@/types';

interface BroadcastMessage {
    id: number;
    message: string;
    parse_mode: string;
    media_type: string;
    media_url?: string;
    buttons: any[];
    recipient_type: 'all' | 'selected';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    progress: number;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

interface Props {
    broadcast: BroadcastMessage;
}

const MEDIA_ICONS = {
    none: FileText,
    photo: Image,
    video: FileVideo,
    audio: FileAudio,
    voice: Mic,
    document: FileText,
};

const PARSE_MODE_CONFIG: Record<string, { label: string; icon: typeof Type; color: string }> = {
    none: { label: 'Plain Text', icon: Type, color: 'text-gray-400' },
    HTML: { label: 'HTML', icon: Code, color: 'text-orange-400' },
    Markdown: { label: 'Markdown', icon: Code, color: 'text-blue-400' },
    MarkdownV2: { label: 'Markdown V2', icon: Code, color: 'text-purple-400' },
};

const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
    processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing', animate: true },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
};

export default function BroadcastShow({ broadcast: initialBroadcast }: Props) {
    const [broadcast, setBroadcast] = useState(initialBroadcast);
    const [isPolling, setIsPolling] = useState(initialBroadcast.status === 'processing');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Send Message', href: '/admin/broadcast' },
        { title: `Broadcast #${broadcast.id}`, href: '#' },
    ];

    // Poll for progress updates when processing
    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/admin/broadcast/${broadcast.id}/progress`);
                const data = await response.json();

                setBroadcast(prev => ({
                    ...prev,
                    status: data.status,
                    progress: data.progress,
                    sent_count: data.sent_count,
                    failed_count: data.failed_count,
                }));

                if (data.status !== 'processing') {
                    setIsPolling(false);
                }
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isPolling, broadcast.id]);

    const StatusIcon = statusConfig[broadcast.status].icon;
    const config = statusConfig[broadcast.status];
    const MediaIcon = MEDIA_ICONS[broadcast.media_type as keyof typeof MEDIA_ICONS] || FileText;

    // Format message based on parse_mode
    const formattedMessage = useMemo(() => {
        let text = broadcast.message || '';

        if (broadcast.parse_mode === 'HTML') {
            text = text
                .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
                .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
                .replace(/<code>(.*?)<\/code>/g, '<code class="bg-black/20 px-1 rounded">$1</code>')
                .replace(/<a href="(.*?)">(.*?)<\/a>/g, '<a href="$1" class="text-blue-400 underline">$2</a>');
        } else if (broadcast.parse_mode === 'Markdown' || broadcast.parse_mode === 'MarkdownV2') {
            text = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                .replace(/_(.*?)_/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>');
        }

        return text;
    }, [broadcast.message, broadcast.parse_mode]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Broadcast #${broadcast.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/broadcast">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Send className="h-8 w-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Broadcast #{broadcast.id}</h1>
                                <p className="text-muted-foreground text-sm">
                                    Created {new Date(broadcast.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                        <span className={`font-medium ${config.color}`}>{config.label}</span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Progress Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Progress</CardTitle>
                            <CardDescription>
                                {broadcast.recipient_type === 'all' ? 'Sending to all users' : 'Sending to selected users'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress</span>
                                    <span className="font-mono">{broadcast.progress}%</span>
                                </div>
                                <div className="h-4 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${broadcast.status === 'completed' ? 'bg-green-500' :
                                            broadcast.status === 'failed' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}
                                        style={{ width: `${broadcast.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-3xl font-bold">{broadcast.total_recipients}</p>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                </div>
                                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                                    <p className="text-3xl font-bold text-green-500">{broadcast.sent_count}</p>
                                    <p className="text-sm text-muted-foreground">Sent</p>
                                </div>
                                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                    <p className="text-3xl font-bold text-red-500">{broadcast.failed_count}</p>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                </div>
                            </div>

                            {/* Timing */}
                            {broadcast.started_at && (
                                <div className="text-sm space-y-1">
                                    <p>
                                        <span className="text-muted-foreground">Started:</span>{' '}
                                        {new Date(broadcast.started_at).toLocaleString()}
                                    </p>
                                    {broadcast.completed_at && (
                                        <p>
                                            <span className="text-muted-foreground">Completed:</span>{' '}
                                            {new Date(broadcast.completed_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {isPolling && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Auto-refreshing...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Message Preview */}
                    <Card className="bg-[#0e1621] border-0 overflow-hidden">
                        <CardHeader className="bg-[#17212b] border-b border-white/10 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                    B
                                </div>
                                <div>
                                    <p className="font-medium text-white">Message Preview</p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {(() => {
                                            const parseConfig = PARSE_MODE_CONFIG[broadcast.parse_mode] || PARSE_MODE_CONFIG.none;
                                            const ParseIcon = parseConfig.icon;
                                            return (
                                                <>
                                                    <ParseIcon className={`h-3 w-3 ${parseConfig.color}`} />
                                                    <span className={parseConfig.color}>{parseConfig.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 min-h-[300px] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22%230e1621%22%2F%3E%3Cpath%20d%3D%22M30%2030m-1%200a1%201%200%201%201%202%200a1%201%200%201%201%20-2%200%22%20fill%3D%22%231a2836%22%2F%3E%3C%2Fsvg%3E')]">
                            <div className="flex justify-start">
                                <div className="max-w-[85%] bg-[#182533] rounded-xl rounded-bl-sm overflow-hidden">
                                    {/* Media */}
                                    {broadcast.media_type !== 'none' && (
                                        <div className="bg-black/30">
                                            {broadcast.media_type === 'photo' && broadcast.media_url ? (
                                                <img src={broadcast.media_url} alt="Media" className="w-full max-h-48 object-cover" />
                                            ) : (
                                                <div className="p-6 flex items-center justify-center">
                                                    <div className="flex items-center gap-3 text-white">
                                                        <MediaIcon className="h-10 w-10" />
                                                        <p className="text-sm font-medium capitalize">{broadcast.media_type}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="px-3 py-2">
                                        <div
                                            className="text-white text-sm whitespace-pre-wrap break-words"
                                            dangerouslySetInnerHTML={{ __html: formattedMessage }}
                                        />
                                        <p className="text-[10px] text-gray-400 text-right mt-1">12:00 ✓✓</p>
                                    </div>

                                    {/* Buttons */}
                                    {broadcast.buttons && broadcast.buttons.length > 0 && (
                                        <div className="border-t border-white/10 p-1 space-y-1">
                                            {broadcast.buttons.map((row: any[], rowIdx: number) => (
                                                <div key={rowIdx} className="flex gap-1">
                                                    {row.map((btn: any, btnIdx: number) => (
                                                        <button
                                                            key={btnIdx}
                                                            className="flex-1 py-2 px-3 text-[13px] text-[#64b5ef] bg-[#2b5278]/30 rounded text-center truncate"
                                                        >
                                                            {btn.text || 'Button'}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link href="/admin/broadcast">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                    <Link href="/admin/broadcast/create">
                        <Button>
                            <Send className="mr-2 h-4 w-4" />
                            New Broadcast
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
