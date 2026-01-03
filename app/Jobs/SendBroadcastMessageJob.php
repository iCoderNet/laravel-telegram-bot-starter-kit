<?php

namespace App\Jobs;

use App\Models\BroadcastMessage;
use App\Models\TelegramUser;
use App\Services\TelegramBotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBroadcastMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 5;

    public function __construct(
        public BroadcastMessage $broadcast,
        public TelegramUser $user
    ) {
    }

    public function handle(TelegramBotService $telegramService): void
    {
        if (!$telegramService->isConfigured()) {
            Log::warning('Telegram bot not configured for broadcast', [
                'broadcast_id' => $this->broadcast->id,
                'user_id' => $this->user->telegram_id,
            ]);
            $this->broadcast->incrementFailed();
            return;
        }

        try {
            $chatId = $this->user->telegram_id;
            $message = $this->broadcast->message;
            $options = [];

            // Add parse mode
            $parseMode = $this->broadcast->getTelegramParseMode();
            if ($parseMode) {
                $options['parse_mode'] = $parseMode;
            }

            // Add inline keyboard
            $keyboard = $this->broadcast->getInlineKeyboard();
            if ($keyboard) {
                $options['reply_markup'] = json_encode([
                    'inline_keyboard' => $keyboard,
                ]);
            }

            // Send based on media type
            if ($this->broadcast->hasMedia()) {
                $mediaPath = $this->broadcast->getMediaFullPath();

                $result = match ($this->broadcast->media_type) {
                    'photo' => $telegramService->sendPhoto($chatId, $mediaPath, $message, $options),
                    'video' => $telegramService->sendVideo($chatId, $mediaPath, $message, $options),
                    'audio' => $telegramService->sendAudio($chatId, $mediaPath, $message, $options),
                    'voice' => $telegramService->sendVoice($chatId, $mediaPath, $message, $options),
                    'document' => $telegramService->sendDocument($chatId, $mediaPath, $message, $options),
                    default => $telegramService->sendMessage($chatId, $message, $options),
                };
            } else {
                $result = $telegramService->sendMessage($chatId, $message, $options);
            }

            if ($result['ok'] ?? false) {
                $this->broadcast->incrementSent();
            } else {
                Log::warning('Broadcast message failed', [
                    'broadcast_id' => $this->broadcast->id,
                    'user_id' => $this->user->telegram_id,
                    'error' => $result['description'] ?? 'Unknown error',
                ]);
                $this->broadcast->incrementFailed();
            }

            // Check if broadcast is completed
            $this->checkBroadcastCompletion();

            // Rate limiting: 30 messages per second
            usleep(35000); // ~35ms delay

        } catch (\Exception $e) {
            Log::error('Broadcast job exception', [
                'broadcast_id' => $this->broadcast->id,
                'user_id' => $this->user->telegram_id,
                'error' => $e->getMessage(),
            ]);
            $this->broadcast->incrementFailed();
            $this->checkBroadcastCompletion();
        }
    }

    protected function checkBroadcastCompletion(): void
    {
        $this->broadcast->refresh();

        $processed = $this->broadcast->sent_count + $this->broadcast->failed_count;

        if ($processed >= $this->broadcast->total_recipients) {
            $this->broadcast->markAsCompleted();
        }
    }
}
