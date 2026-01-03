import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, FileAudio, FileText, FileVideo, Image, Loader2, Mic, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';

import type { BreadcrumbItem } from '@/types';

interface ButtonItem {
    text: string;
    type: 'url' | 'miniapp' | 'callback';
    url: string;
    callback?: string;
}

interface BotCommand {
    id: number;
    trigger: string;
    trigger_type: 'command' | 'text';
    response: string;
    parse_mode: 'none' | 'HTML' | 'Markdown' | 'MarkdownV2';
    media_type: 'none' | 'photo' | 'video' | 'audio' | 'voice' | 'document';
    media_path: string | null;
    media_url?: string;
    buttons: ButtonItem[][] | null;
    is_active: boolean;
}

interface Props {
    command: BotCommand | null;
}

const MEDIA_ICONS = {
    none: FileText,
    photo: Image,
    video: FileVideo,
    audio: FileAudio,
    voice: Mic,
    document: FileText,
};

export default function CommandForm({ command }: Props) {
    const isEditing = !!command;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(command?.media_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin' },
        { title: 'Commands', href: '/admin/commands' },
        { title: isEditing ? 'Edit Command' : 'Create Command', href: '#' },
    ];

    const form = useForm({
        trigger: command?.trigger || '',
        trigger_type: command?.trigger_type || 'command',
        response: command?.response || '',
        parse_mode: command?.parse_mode || 'none',
        media_type: command?.media_type || 'none',
        media: null as File | null,
        remove_media: false,
        buttons: (command?.buttons || []) as ButtonItem[][],
        is_active: command?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('trigger', form.data.trigger);
        formData.append('trigger_type', form.data.trigger_type);
        formData.append('response', form.data.response);
        formData.append('parse_mode', form.data.parse_mode);
        formData.append('media_type', form.data.media_type);
        formData.append('is_active', form.data.is_active ? '1' : '0');
        formData.append('buttons', JSON.stringify(form.data.buttons));

        if (form.data.media) {
            formData.append('media', form.data.media);
        }
        if (form.data.remove_media) {
            formData.append('remove_media', '1');
        }

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(`/admin/commands/${command.id}`, formData, {
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/commands', formData, {
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('media', file);
            form.setData('remove_media', false);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        form.setData('media', null);
        form.setData('remove_media', true);
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

    // Format preview message based on parse mode
    const formattedPreview = useMemo(() => {
        let text = form.data.response
            .replace('{first_name}', 'John')
            .replace('{username}', 'john_doe')
            .replace('{user_id}', '123456789');

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
    }, [form.data.response, form.data.parse_mode]);

    const MediaIcon = MEDIA_ICONS[form.data.media_type];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Command' : 'Create Command'} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {isEditing ? 'Edit Command' : 'Create Command'}
                    </h1>
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
                        {/* Command Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Command Details</CardTitle>
                                <CardDescription>
                                    Configure the trigger and response for this command
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="trigger">Trigger</Label>
                                        <Input
                                            id="trigger"
                                            placeholder="/start or Hello"
                                            value={form.data.trigger}
                                            onChange={(e) => form.setData('trigger', e.target.value)}
                                        />
                                        {form.errors.trigger && (
                                            <p className="text-sm text-red-500">{form.errors.trigger}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trigger_type">Trigger Type</Label>
                                        <Select
                                            value={form.data.trigger_type}
                                            onValueChange={(value) => form.setData('trigger_type', value as 'command' | 'text')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="command">Command (starts with /)</SelectItem>
                                                <SelectItem value="text">Text (exact match)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="parse_mode">Parse Mode</Label>
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
                                        <Label htmlFor="media_type">Media Type</Label>
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
                                                        <img
                                                            src={mediaPreview}
                                                            alt="Preview"
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                                                            <MediaIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={removeMedia}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="response">Response Message</Label>
                                    <textarea
                                        id="response"
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter your response message..."
                                        value={form.data.response}
                                        onChange={(e) => form.setData('response', e.target.value)}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Placeholders: {'{first_name}'}, {'{username}'}, {'{user_id}'}
                                        {form.data.parse_mode === 'HTML' && (
                                            <span className="block mt-1">
                                                HTML: {'<b>bold</b>'}, {'<i>italic</i>'}, {'<code>code</code>'}, {'<a href="url">link</a>'}
                                            </span>
                                        )}
                                        {(form.data.parse_mode === 'Markdown' || form.data.parse_mode === 'MarkdownV2') && (
                                            <span className="block mt-1">
                                                Markdown: *bold*, _italic_, `code`, [link](url)
                                            </span>
                                        )}
                                    </p>
                                    {form.errors.response && (
                                        <p className="text-sm text-red-500">{form.errors.response}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inline Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Inline Buttons
                                    <Button type="button" variant="outline" size="sm" onClick={addButtonRow}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Row
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    Add inline keyboard buttons. Each row displays buttons side by side.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {form.data.buttons.length === 0 ? (
                                    <p className="text-muted-foreground text-center text-sm py-8">
                                        No buttons added. Click "Add Row" to add buttons.
                                    </p>
                                ) : (
                                    form.data.buttons.map((row, rowIndex) => (
                                        <div key={rowIndex} className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Row {rowIndex + 1} ({row.length} button{row.length !== 1 ? 's' : ''})
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addButton(rowIndex)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeButtonRow(rowIndex)}
                                                    >
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
                                                            placeholder={
                                                                button.type === 'miniapp' ? 'Mini app URL' :
                                                                    button.type === 'callback' ? 'Callback data' :
                                                                        'https://...'
                                                            }
                                                            value={button.type === 'callback' ? (button.callback || '') : button.url}
                                                            onChange={(e) => updateButton(
                                                                rowIndex,
                                                                buttonIndex,
                                                                button.type === 'callback' ? 'callback' : 'url',
                                                                e.target.value
                                                            )}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeButton(rowIndex, buttonIndex)}
                                                        >
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEditing ? 'Update Command' : 'Create Command'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/admin/commands')}
                            >
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
                                            <p className="text-xs text-gray-400">online</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 min-h-[400px] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22%230e1621%22%2F%3E%3Cpath%20d%3D%22M30%2030m-1%200a1%201%200%201%201%202%200a1%201%200%201%201%20-2%200%22%20fill%3D%22%231a2836%22%2F%3E%3C%2Fsvg%3E')]">
                                    <div className="flex flex-col gap-2">
                                        {/* User message */}
                                        <div className="flex justify-end">
                                            <div className="max-w-[80%] bg-[#2b5278] rounded-xl rounded-br-sm px-3 py-2">
                                                <p className="text-white text-sm">{form.data.trigger || '/start'}</p>
                                                <p className="text-[10px] text-gray-300 text-right mt-1">12:00</p>
                                            </div>
                                        </div>

                                        {/* Bot message */}
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] bg-[#182533] rounded-xl rounded-bl-sm overflow-hidden">
                                                {/* Media preview */}
                                                {form.data.media_type !== 'none' && mediaPreview && (
                                                    <div className="bg-black/30">
                                                        {form.data.media_type === 'photo' ? (
                                                            <img
                                                                src={mediaPreview}
                                                                alt="Media"
                                                                className="w-full max-h-48 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="p-6 flex items-center justify-center">
                                                                <div className="flex items-center gap-3 text-white">
                                                                    <MediaIcon className="h-10 w-10" />
                                                                    <div>
                                                                        <p className="text-sm font-medium capitalize">{form.data.media_type}</p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {form.data.media?.name || 'Media file'}
                                                                        </p>
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
                                                        dangerouslySetInnerHTML={{
                                                            __html: formattedPreview || 'Enter your response message...'
                                                        }}
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
