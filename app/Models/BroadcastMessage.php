<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BroadcastMessage extends Model
{
    protected $fillable = [
        'message',
        'parse_mode',
        'media_type',
        'media_path',
        'buttons',
        'recipient_type',
        'recipient_ids',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'buttons' => 'array',
        'recipient_ids' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Status scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if has media.
     */
    public function hasMedia(): bool
    {
        return $this->media_type !== 'none' && !empty($this->media_path);
    }

    /**
     * Get media URL.
     */
    public function getMediaUrl(): ?string
    {
        if (!$this->hasMedia()) {
            return null;
        }

        return Storage::disk('public')->url($this->media_path);
    }

    /**
     * Get media full path.
     */
    public function getMediaFullPath(): ?string
    {
        if (!$this->hasMedia()) {
            return null;
        }

        return Storage::disk('public')->path($this->media_path);
    }

    /**
     * Get parse mode for Telegram API.
     */
    public function getTelegramParseMode(): ?string
    {
        return $this->parse_mode === 'none' ? null : $this->parse_mode;
    }

    /**
     * Get inline keyboard for Telegram API.
     */
    public function getInlineKeyboard(): ?array
    {
        if (empty($this->buttons)) {
            return null;
        }

        $keyboard = [];
        foreach ($this->buttons as $row) {
            $keyboardRow = [];
            foreach ($row as $button) {
                if (empty($button['text'])) {
                    continue;
                }

                $keyboardButton = ['text' => $button['text']];

                if ($button['type'] === 'url') {
                    $keyboardButton['url'] = $button['url'];
                } elseif ($button['type'] === 'miniapp') {
                    $keyboardButton['web_app'] = ['url' => $button['url']];
                } elseif ($button['type'] === 'callback') {
                    $keyboardButton['callback_data'] = $button['callback'] ?? $button['text'];
                }

                $keyboardRow[] = $keyboardButton;
            }
            if (!empty($keyboardRow)) {
                $keyboard[] = $keyboardRow;
            }
        }

        return empty($keyboard) ? null : $keyboard;
    }

    /**
     * Calculate progress percentage.
     */
    public function getProgressPercentage(): int
    {
        if ($this->total_recipients === 0) {
            return 0;
        }

        return (int) round(($this->sent_count + $this->failed_count) / $this->total_recipients * 100);
    }

    /**
     * Mark as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Increment sent count.
     */
    public function incrementSent(): void
    {
        $this->increment('sent_count');
    }

    /**
     * Increment failed count.
     */
    public function incrementFailed(): void
    {
        $this->increment('failed_count');
    }
}
