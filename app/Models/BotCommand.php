<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BotCommand extends Model
{
    protected $fillable = [
        'trigger',
        'trigger_type',
        'response',
        'parse_mode',
        'media_type',
        'media_path',
        'buttons',
        'is_active',
    ];

    protected $casts = [
        'buttons' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active commands only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for command type triggers.
     */
    public function scopeCommands($query)
    {
        return $query->where('trigger_type', 'command');
    }

    /**
     * Scope for text type triggers.
     */
    public function scopeTexts($query)
    {
        return $query->where('trigger_type', 'text');
    }

    /**
     * Find command by trigger.
     */
    public static function findByTrigger(string $trigger): ?self
    {
        return static::active()
            ->where('trigger', $trigger)
            ->first();
    }

    /**
     * Check if command has media.
     */
    public function hasMedia(): bool
    {
        return $this->media_type !== 'none' && !empty($this->media_path);
    }

    /**
     * Get the Telegram API method to use for sending this command's response.
     */
    public function getSendMethod(): string
    {
        return match ($this->media_type) {
            'photo' => 'sendPhoto',
            'video' => 'sendVideo',
            'audio' => 'sendAudio',
            'voice' => 'sendVoice',
            'document' => 'sendDocument',
            default => 'sendMessage',
        };
    }

    /**
     * Get the parse mode for Telegram API (null if none).
     */
    public function getTelegramParseMode(): ?string
    {
        return $this->parse_mode === 'none' ? null : $this->parse_mode;
    }

    /**
     * Get full URL for media file.
     */
    public function getMediaUrl(): ?string
    {
        if (!$this->hasMedia()) {
            return null;
        }

        return Storage::disk('public')->url($this->media_path);
    }

    /**
     * Get full path for media file.
     */
    public function getMediaFullPath(): ?string
    {
        if (!$this->hasMedia()) {
            return null;
        }

        return Storage::disk('public')->path($this->media_path);
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
     * Delete associated media file.
     */
    public function deleteMedia(): void
    {
        if ($this->hasMedia()) {
            Storage::disk('public')->delete($this->media_path);
            $this->update(['media_type' => 'none', 'media_path' => null]);
        }
    }
}
