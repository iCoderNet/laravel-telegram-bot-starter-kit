import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Ban, Check, Eye, Search, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';

interface TelegramUser {
    id: number;
    telegram_id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    language_code: string | null;
    is_bot: boolean;
    is_blocked: boolean;
    last_activity_at: string | null;
    created_at: string;
}

interface PaginatedData {
    data: TelegramUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    users: PaginatedData;
    filters: {
        search: string | null;
        status: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
    { title: 'Telegram Users', href: '/admin/telegram-users' },
];

export default function TelegramUsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/telegram-users', { search, status: status === 'all' ? undefined : status }, {
            preserveState: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/admin/telegram-users', { search, status: value === 'all' ? undefined : value }, {
            preserveState: true,
        });
    };

    const handleToggle = (id: number) => {
        router.post(`/admin/telegram-users/${id}/toggle`, {}, {
            onSuccess: () => toast.success('User status updated'),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/admin/telegram-users/${id}`, {
                onSuccess: () => toast.success('User deleted successfully'),
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Telegram Users" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Telegram Users</h1>
                    <span className="text-muted-foreground text-sm">Total: {users.total}</span>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search by name, username, or Telegram ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Telegram ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Language</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Last Activity</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="border-b last:border-0">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {user.is_blocked && <UserX className="h-4 w-4 text-red-500" />}
                                                        <span>
                                                            {user.first_name} {user.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-sm">{user.telegram_id}</td>
                                                <td className="px-4 py-3">
                                                    {user.username ? `@${user.username}` : '-'}
                                                </td>
                                                <td className="px-4 py-3">{user.language_code || '-'}</td>
                                                <td className="px-4 py-3">
                                                    {user.is_blocked ? (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-3 text-sm">
                                                    {formatDate(user.last_activity_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleToggle(user.id)}
                                                            title={user.is_blocked ? 'Unblock' : 'Block'}
                                                        >
                                                            {user.is_blocked ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Ban className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {users.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
