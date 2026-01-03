import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, FileAudio, FileText, FileVideo, Image, Loader2, Mic, Plus, Search, Send, Trash2, Upload, Users, X } from 'lucide-react';
import { useState, useRef, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

import type { BreadcrumbItem } from '@/types';

interface TelegramUser {
    id: number;
    telegram_id: string;
    first_name: string;
    last_name: string | null;
    username: string | null;
}

interface ButtonItem {
    text: string;
    type: 'url' | 'miniapp' | 'callback';
    url: string;
    callback?: string;
}

interface Props {
    totalUsers: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Send Message', href: '/admin/broadcast' },
    { title: 'New Broadcast', href: '#' },
];

const MEDIA_ICONS = {
    none: FileText,
    photo: Image,
    video: FileVideo,
    audio: FileAudio,
    voice: Mic,
    document: FileText,
};

export default function BroadcastCreate({ totalUsers }: Props) {
    const [previewOpen, setPreviewOpen] = useState(true);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TelegramUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<TelegramUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        message: '',
        parse_mode: 'none' as 'none' | 'HTML' | 'Markdown' | 'MarkdownV2',
        media_type: 'none' as 'none' | 'photo' | 'video' | 'audio' | 'voice' | 'document',
        media: null as File | null,
        buttons: [] as ButtonItem[][],
        recipient_type: 'all' as 'all' | 'selected',
        recipient_ids: [] as number[],
    });

    // Debounced search
    const searchUsers = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`/admin/broadcast/search-users?search=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSearchResults(data.filter((u: TelegramUser) => !selectedUsers.some(s => s.id === u.id)));
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        [selectedUsers]
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        searchUsers(value);
    };

    const selectUser = (user: TelegramUser) => {
        setSelectedUsers([...selectedUsers, user]);
        form.setData('recipient_ids', [...form.data.recipient_ids, user.id]);
        setSearchResults(searchResults.filter(u => u.id !== user.id));
        setSearchQuery('');
    };

    const removeUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
        form.setData('recipient_ids', form.data.recipient_ids.filter(id => id !== userId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return; // Prevent double submission
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('message', form.data.message);
        formData.append('parse_mode', form.data.parse_mode);
        formData.append('media_type', form.data.media_type);
        formData.append('buttons', JSON.stringify(form.data.buttons));
        formData.append('recipient_type', form.data.recipient_type);

        if (form.data.media) {
            formData.append('media', form.data.media);
        }

        form.data.recipient_ids.forEach(id => {
            formData.append('recipient_ids[]', id.toString());
        });

        router.post('/admin/broadcast', formData, {
            onError: () => setIsSubmitting(false),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('media', file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        form.setData('media', null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Button management
    const addButtonRow = () => {
        form.setData('buttons', [...form.data.buttons, [{ text: '', type: 'url', url: '' }]]);
    };

    const removeButtonRow = (rowIndex: number) => {
        form.setData('buttons', form.data.buttons.filter((_, i) => i !== rowIndex));
    };

    const addButton = (rowIndex: number) => {
        const newButtons = [...form.data.buttons];
        newButtons[rowIndex] = [...newButtons[rowIndex], { text: '', type: 'url', url: '' }];
        form.setData('buttons', newButtons);
    };

    const removeButton = (rowIndex: number, buttonIndex: number) => {
        const newButtons = [...form.data.buttons];
        newButtons[rowIndex] = newButtons[rowIndex].filter((_, i) => i !== buttonIndex);
        if (newButtons[rowIndex].length === 0) {
            newButtons.splice(rowIndex, 1);
        }
        form.setData('buttons', newButtons);
    };

    const updateButton = (rowIndex: number, buttonIndex: number, field: keyof ButtonItem, value: string) => {
        const newButtons = [...form.data.buttons];
        newButtons[rowIndex] = [...newButtons[rowIndex]];
        newButtons[rowIndex][buttonIndex] = {
            ...newButtons[rowIndex][buttonIndex],
            [field]: value,
        };
        form.setData('buttons', newButtons);
    };

    // Format preview
    const formattedPreview = useMemo(() => {
        let text = form.data.message || 'Enter your message...';

        if (form.data.parse_mode === 'HTML') {
            text = text
                .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
                .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
                .replace(/<code>(.*?)<\/code>/g, '<code class="bg-black/20 px-1 rounded">$1</code>')
                .replace(/<a href="(.*?)">(.*?)<\/a>/g, '<a href="$1" class="text-blue-400 underline">$2</a>');
        } else if (form.data.parse_mode === 'Markdown' || form.data.parse_mode === 'MarkdownV2') {
            text = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                .replace(/_(.*?)_/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>');
        }

        return text;
    }, [form.data.message, form.data.parse_mode]);

    const MediaIcon = MEDIA_ICONS[form.data.media_type];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Broadcast" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Send className="h-8 w-8" />
                        <h1 className="text-2xl font-bold">New Broadcast</h1>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPreviewOpen(!previewOpen)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewOpen ? 'Hide Preview' : 'Preview'}
                    </Button>
                </div>

                <div className={`grid gap-6 ${previewOpen ? 'lg:grid-cols-2' : ''}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recipients */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Recipients
                                </CardTitle>
                                <CardDescription>
                                    Choose who will receive this message
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant={form.data.recipient_type === 'all' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => form.setData('recipient_type', 'all')}
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        All Users ({totalUsers})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={form.data.recipient_type === 'selected' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => form.setData('recipient_type', 'selected')}
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Selected Users
                                    </Button>
                                </div>

                                {form.data.recipient_type === 'selected' && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search users by name, username, or ID..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                className="pl-10"
                                            />
                                            {isSearching && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                                            )}
                                        </div>

                                        {/* Search Results */}
                                        {searchResults.length > 0 && (
                                            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                                {searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
                                                        onClick={() => selectUser(user)}
                                                    >
                                                        <span>
                                                            {user.first_name} {user.last_name}
                                                            {user.username && <span className="text-muted-foreground ml-2">@{user.username}</span>}
                                                        </span>
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Selected Users */}
                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                                                    >
                                                        <span>{user.first_name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeUser(user.id)}
                                                            className="hover:bg-primary/20 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {form.errors.recipient_ids && (
                                            <p className="text-sm text-red-500">{form.errors.recipient_ids}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Message */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Message</CardTitle>
                                <CardDescription>
                                    Compose your broadcast message
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Parse Mode</Label>
                                        <Select
                                            value={form.data.parse_mode}
                                            onValueChange={(value) => form.setData('parse_mode', value as typeof form.data.parse_mode)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (Plain text)</SelectItem>
                                                <SelectItem value="HTML">HTML</SelectItem>
                                                <SelectItem value="Markdown">Markdown</SelectItem>
                                                <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Media Type</Label>
                                        <Select
                                            value={form.data.media_type}
                                            onValueChange={(value) => form.setData('media_type', value as typeof form.data.media_type)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No media</SelectItem>
                                                <SelectItem value="photo">Photo</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="audio">Audio</SelectItem>
                                                <SelectItem value="voice">Voice</SelectItem>
                                                <SelectItem value="document">Document</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Media Upload */}
                                {form.data.media_type !== 'none' && (
                                    <div className="space-y-2">
                                        <Label>Media File</Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileChange}
                                                accept={
                                                    form.data.media_type === 'photo' ? 'image/*' :
                                                        form.data.media_type === 'video' ? 'video/*' :
                                                            form.data.media_type === 'audio' ? 'audio/*' :
                                                                form.data.media_type === 'voice' ? 'audio/ogg,audio/mpeg' :
                                                                    '*/*'
                                                }
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload {form.data.media_type}
                                            </Button>
                                            {mediaPreview && (
                                                <div className="flex items-center gap-2">
                                                    {form.data.media_type === 'photo' ? (
                                                        <img src={mediaPreview} alt="Preview" className="h-12 w-12 rounded object-cover" />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                            <MediaIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <Button type="button" variant="ghost" size="sm" onClick={removeMedia}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message Text</Label>
                                    <textarea
                                        id="message"
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[150px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        placeholder="Enter your broadcast message..."
                                        value={form.data.message}
                                        onChange={(e) => form.setData('message', e.target.value)}
                                    />
                                    {form.data.parse_mode !== 'none' && (
                                        <p className="text-xs text-muted-foreground">
                                            {form.data.parse_mode === 'HTML' ? (
                                                <>Supported: {'<b>bold</b>'}, {'<i>italic</i>'}, {'<code>code</code>'}, {'<a href="url">link</a>'}</>
                                            ) : (
                                                <>Supported: *bold*, _italic_, `code`, [link](url)</>
                                            )}
                                        </p>
                                    )}
                                    {form.errors.message && (
                                        <p className="text-sm text-red-500">{form.errors.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inline Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Inline Buttons (Optional)
                                    <Button type="button" variant="outline" size="sm" onClick={addButtonRow}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Row
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {form.data.buttons.length === 0 ? (
                                    <p className="text-muted-foreground text-center text-sm py-4">
                                        No buttons added. Click "Add Row" to add inline buttons.
                                    </p>
                                ) : (
                                    form.data.buttons.map((row, rowIndex) => (
                                        <div key={rowIndex} className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">Row {rowIndex + 1}</span>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" size="sm" onClick={() => addButton(rowIndex)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeButtonRow(rowIndex)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {row.map((button, buttonIndex) => (
                                                    <div key={buttonIndex} className="flex gap-2 items-center p-2 rounded bg-muted/50">
                                                        <Input
                                                            placeholder="Button text"
                                                            value={button.text}
                                                            onChange={(e) => updateButton(rowIndex, buttonIndex, 'text', e.target.value)}
                                                            className="w-32 sm:w-40"
                                                        />
                                                        <Select
                                                            value={button.type}
                                                            onValueChange={(value) => updateButton(rowIndex, buttonIndex, 'type', value)}
                                                        >
                                                            <SelectTrigger className="w-28">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="url">URL</SelectItem>
                                                                <SelectItem value="miniapp">Mini App</SelectItem>
                                                                <SelectItem value="callback">Callback</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            placeholder={button.type === 'callback' ? 'Callback data' : 'URL'}
                                                            value={button.type === 'callback' ? (button.callback || '') : button.url}
                                                            onChange={(e) => updateButton(rowIndex, buttonIndex, button.type === 'callback' ? 'callback' : 'url', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeButton(rowIndex, buttonIndex)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting} size="lg">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Broadcast
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.visit('/admin/broadcast')}>
                                Cancel
                            </Button>
                        </div>
                    </form>

                    {/* Telegram Preview */}
                    {previewOpen && (
                        <div className="lg:sticky lg:top-4 h-fit">
                            <Card className="bg-[#0e1621] border-0 overflow-hidden">
                                <CardHeader className="bg-[#17212b] border-b border-white/10 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            B
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Bot Preview</p>
                                            <p className="text-xs text-gray-400">
                                                {form.data.recipient_type === 'all'
                                                    ? `Sending to ${totalUsers} users`
                                                    : `Sending to ${selectedUsers.length} users`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 min-h-[400px] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22%230e1621%22%2F%3E%3Cpath%20d%3D%22M30%2030m-1%200a1%201%200%201%201%202%200a1%201%200%201%201%20-2%200%22%20fill%3D%22%231a2836%22%2F%3E%3C%2Fsvg%3E')]">
                                    <div className="flex flex-col gap-2">
                                        {/* Bot message */}
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] bg-[#182533] rounded-xl rounded-bl-sm overflow-hidden">
                                                {/* Media preview */}
                                                {form.data.media_type !== 'none' && mediaPreview && (
                                                    <div className="bg-black/30">
                                                        {form.data.media_type === 'photo' ? (
                                                            <img src={mediaPreview} alt="Media" className="w-full max-h-48 object-cover" />
                                                        ) : (
                                                            <div className="p-6 flex items-center justify-center">
                                                                <div className="flex items-center gap-3 text-white">
                                                                    <MediaIcon className="h-10 w-10" />
                                                                    <div>
                                                                        <p className="text-sm font-medium capitalize">{form.data.media_type}</p>
                                                                        <p className="text-xs text-gray-400">{form.data.media?.name || 'Media file'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message text */}
                                                <div className="px-3 py-2">
                                                    <div
                                                        className="text-white text-sm whitespace-pre-wrap break-words"
                                                        dangerouslySetInnerHTML={{ __html: formattedPreview }}
                                                    />
                                                    <p className="text-[10px] text-gray-400 text-right mt-1">12:00 ✓✓</p>
                                                </div>

                                                {/* Inline buttons */}
                                                {form.data.buttons.length > 0 && (
                                                    <div className="border-t border-white/10 p-1 space-y-1">
                                                        {form.data.buttons.map((row, rowIdx) => (
                                                            <div key={rowIdx} className="flex gap-1">
                                                                {row.map((btn, btnIdx) => (
                                                                    <button
                                                                        key={btnIdx}
                                                                        className="flex-1 py-2 px-3 text-[13px] text-[#64b5ef] bg-[#2b5278]/30 hover:bg-[#2b5278]/50 rounded transition-colors text-center truncate"
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
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
