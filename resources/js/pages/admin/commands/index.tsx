import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';

interface BotCommand {
    id: number;
    trigger: string;
    trigger_type: 'command' | 'text';
    response: string;
    buttons: Array<Array<{ text: string; type: string; url: string }>> | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    commands: BotCommand[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Commands', href: '/admin/commands' },
];

export default function CommandsIndex({ commands }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this command?')) {
            router.delete(`/admin/commands/${id}`, {
                onSuccess: () => toast.success('Command deleted successfully'),
            });
        }
    };

    const handleToggle = (id: number) => {
        router.post(`/admin/commands/${id}/toggle`, {}, {
            onSuccess: () => toast.success('Command status updated'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bot Commands" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Bot Commands</h1>
                    <Button asChild>
                        <Link href="/admin/commands/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Command
                        </Link>
                    </Button>
                </div>

                {commands.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <p className="text-muted-foreground mb-4">No commands found</p>
                            <Button asChild>
                                <Link href="/admin/commands/create">Create your first command</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {commands.map((command) => (
                            <Card key={command.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">
                                                {command.trigger}
                                            </code>
                                            <span className="text-muted-foreground text-xs font-normal">
                                                ({command.trigger_type})
                                            </span>
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={command.is_active ? 'default' : 'secondary'}
                                                size="sm"
                                                onClick={() => handleToggle(command.id)}
                                            >
                                                {command.is_active ? 'Active' : 'Inactive'}
                                            </Button>
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href={`/admin/commands/${command.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(command.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        {command.response.length > 100
                                            ? command.response.substring(0, 100) + '...'
                                            : command.response}
                                    </CardDescription>
                                </CardHeader>
                                {command.buttons && command.buttons.length > 0 && (
                                    <CardContent className="pt-0">
                                        <div className="text-muted-foreground text-xs">
                                            {command.buttons.flat().length} button(s)
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
