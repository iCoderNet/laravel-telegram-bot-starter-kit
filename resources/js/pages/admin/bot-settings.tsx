import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';

interface Props {
    currentToken: string;
    webhookUrl: string;
    defaultWebhookUrl: string;
}

interface BotInfo {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
}

interface WebhookInfo {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Bot Settings', href: '/admin/bot-settings' },
];

export default function BotSettings({ currentToken, webhookUrl, defaultWebhookUrl }: Props) {
    const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
    const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingWebhook, setLoadingWebhook] = useState(false);
    const [settingWebhook, setSettingWebhook] = useState(false);

    const tokenForm = useForm({
        token: '',
    });

    const webhookForm = useForm({
        url: webhookUrl || defaultWebhookUrl || '',
    });

    const fetchBotStatus = async () => {
        setLoadingStatus(true);
        try {
            const response = await fetch('/admin/bot-settings/status');
            const data = await response.json();
            if (data.success) {
                setBotInfo(data.bot);
                toast.success('Bot status fetched successfully');
            } else {
                toast.error(data.error || 'Failed to fetch bot status');
            }
        } catch {
            toast.error('Failed to fetch bot status');
        } finally {
            setLoadingStatus(false);
        }
    };

    const fetchWebhookInfo = async () => {
        setLoadingWebhook(true);
        try {
            const response = await fetch('/admin/bot-settings/webhook-info');
            const data = await response.json();
            if (data.success) {
                setWebhookInfo(data.webhook);
                toast.success('Webhook info fetched successfully');
            } else {
                toast.error(data.error || 'Failed to fetch webhook info');
            }
        } catch {
            toast.error('Failed to fetch webhook info');
        } finally {
            setLoadingWebhook(false);
        }
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        tokenForm.post('/admin/bot-settings/token', {
            onSuccess: () => {
                tokenForm.reset();
            },
        });
    };

    const handleWebhookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingWebhook(true);
        try {
            const response = await fetch('/admin/bot-settings/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ url: webhookForm.data.url }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Webhook set successfully');
                fetchWebhookInfo();
            } else {
                toast.error(data.error || 'Failed to set webhook');
            }
        } catch {
            toast.error('Failed to set webhook');
        } finally {
            setSettingWebhook(false);
        }
    };

    const handleDeleteWebhook = async () => {
        try {
            const response = await fetch('/admin/bot-settings/webhook', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Webhook deleted successfully');
                setWebhookInfo(null);
            } else {
                toast.error(data.error || 'Failed to delete webhook');
            }
        } catch {
            toast.error('Failed to delete webhook');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bot Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Bot Settings</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Token Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bot Token</CardTitle>
                            <CardDescription>
                                Update your Telegram bot token
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleTokenSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Token</Label>
                                    <Input value={currentToken || 'Not set'} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="token">New Token</Label>
                                    <Input
                                        id="token"
                                        type="password"
                                        placeholder="Enter new bot token"
                                        value={tokenForm.data.token}
                                        onChange={(e) => tokenForm.setData('token', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={tokenForm.processing}>
                                    {tokenForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Token
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Bot Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Bot Status
                                <Button variant="outline" size="sm" onClick={fetchBotStatus} disabled={loadingStatus}>
                                    {loadingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                View current bot information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {botInfo ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Username:</span>
                                        <span className="font-medium">@{botInfo.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">{botInfo.first_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID:</span>
                                        <span className="font-medium">{botInfo.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Can Join Groups:</span>
                                        {botInfo.can_join_groups ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Click refresh to load bot status
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Webhook Settings */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Webhook Settings
                                <Button variant="outline" size="sm" onClick={fetchWebhookInfo} disabled={loadingWebhook}>
                                    {loadingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Configure webhook URL for receiving updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleWebhookSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook-url">Webhook URL</Label>
                                    <Input
                                        id="webhook-url"
                                        type="url"
                                        placeholder="https://yourdomain.com/telegram/webhook"
                                        value={webhookForm.data.url}
                                        onChange={(e) => webhookForm.setData('url', e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={settingWebhook}>
                                        {settingWebhook && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Set Webhook
                                    </Button>
                                    {webhookInfo?.url && (
                                        <Button type="button" variant="destructive" onClick={handleDeleteWebhook}>
                                            Delete Webhook
                                        </Button>
                                    )}
                                </div>
                            </form>

                            {webhookInfo && (
                                <div className="mt-6 rounded-lg border p-4">
                                    <h4 className="mb-3 font-medium">Current Webhook Info</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">URL:</span>
                                            <span className="font-mono text-xs">{webhookInfo.url || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pending Updates:</span>
                                            <span>{webhookInfo.pending_update_count}</span>
                                        </div>
                                        {webhookInfo.last_error_message && (
                                            <div className="mt-2 rounded bg-red-50 p-2 text-red-600 dark:bg-red-900/20">
                                                Last Error: {webhookInfo.last_error_message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
