<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramUser extends Model
{
    protected $fillable = [
        'telegram_id',
        'first_name',
        'last_name',
        'username',
        'language_code',
        'is_bot',
        'is_blocked',
        'last_activity_at',
    ];

    protected $casts = [
        'telegram_id' => 'integer',
        'is_bot' => 'boolean',
        'is_blocked' => 'boolean',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Get full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Scope for active (not blocked) users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_blocked', false);
    }

    /**
     * Scope for blocked users.
     */
    public function scopeBlocked($query)
    {
        return $query->where('is_blocked', true);
    }

    /**
     * Scope for search by name or username.
     */
    public function scopeSearch($query, ?string $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('telegram_id', 'like', "%{$search}%");
        });
    }

    /**
     * Create or update user from Telegram data.
     */
    public static function updateFromTelegram(array $from): self
    {
        return static::updateOrCreate(
            ['telegram_id' => $from['id']],
            [
                'first_name' => $from['first_name'] ?? null,
                'last_name' => $from['last_name'] ?? null,
                'username' => $from['username'] ?? null,
                'language_code' => $from['language_code'] ?? null,
                'is_bot' => $from['is_bot'] ?? false,
                'last_activity_at' => now(),
            ]
        );
    }
}
