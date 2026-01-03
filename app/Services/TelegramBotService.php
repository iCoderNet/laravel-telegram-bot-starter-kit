<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotService
{
    protected ?string $botToken;
    protected string $apiUrl;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->apiUrl = $this->botToken
            ? "https://api.telegram.org/bot{$this->botToken}"
            : '';
    }

    /**
     * Check if bot is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->botToken);
    }

    /**
     * Send request to Telegram API.
     */
    public function request(string $method, array $data = []): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'error' => 'Bot token is not configured'];
        }

        try {
            $response = Http::post("{$this->apiUrl}/{$method}", $data);

            return $response->json() ?? ['ok' => false, 'error' => 'Empty response'];
        } catch (\Exception $e) {
            Log::error("Telegram API error: {$e->getMessage()}");

            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send request with file attachment.
     */
    public function requestWithFile(string $method, array $data, string $fileField, string $filePath): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'error' => 'Bot token is not configured'];
        }

        try {
            $response = Http::attach(
                $fileField,
                file_get_contents($filePath),
                basename($filePath)
            )->post("{$this->apiUrl}/{$method}", $data);

            return $response->json() ?? ['ok' => false, 'error' => 'Empty response'];
        } catch (\Exception $e) {
            Log::error("Telegram API error: {$e->getMessage()}");

            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send text message.
     */
    public function sendMessage(int $chatId, string $text, array $options = []): array
    {
        return $this->request('sendMessage', array_merge([
            'chat_id' => $chatId,
            'text' => $text,
        ], $options));
    }

    /**
     * Send photo with optional caption.
     */
    public function sendPhoto(int $chatId, string $photoPath, ?string $caption = null, array $options = []): array
    {
        $data = array_merge(['chat_id' => $chatId], $options);

        if ($caption) {
            $data['caption'] = $caption;
        }

        return $this->requestWithFile('sendPhoto', $data, 'photo', $photoPath);
    }

    /**
     * Send video with optional caption.
     */
    public function sendVideo(int $chatId, string $videoPath, ?string $caption = null, array $options = []): array
    {
        $data = array_merge(['chat_id' => $chatId], $options);

        if ($caption) {
            $data['caption'] = $caption;
        }

        return $this->requestWithFile('sendVideo', $data, 'video', $videoPath);
    }

    /**
     * Send audio file.
     */
    public function sendAudio(int $chatId, string $audioPath, ?string $caption = null, array $options = []): array
    {
        $data = array_merge(['chat_id' => $chatId], $options);

        if ($caption) {
            $data['caption'] = $caption;
        }

        return $this->requestWithFile('sendAudio', $data, 'audio', $audioPath);
    }

    /**
     * Send voice message.
     */
    public function sendVoice(int $chatId, string $voicePath, ?string $caption = null, array $options = []): array
    {
        $data = array_merge(['chat_id' => $chatId], $options);

        if ($caption) {
            $data['caption'] = $caption;
        }

        return $this->requestWithFile('sendVoice', $data, 'voice', $voicePath);
    }

    /**
     * Send document/file.
     */
    public function sendDocument(int $chatId, string $documentPath, ?string $caption = null, array $options = []): array
    {
        $data = array_merge(['chat_id' => $chatId], $options);

        if ($caption) {
            $data['caption'] = $caption;
        }

        return $this->requestWithFile('sendDocument', $data, 'document', $documentPath);
    }

    /**
     * Delete message.
     */
    public function deleteMessage(int $chatId, int $messageId): array
    {
        return $this->request('deleteMessage', [
            'chat_id' => $chatId,
            'message_id' => $messageId,
        ]);
    }

    /**
     * Send message with inline keyboard.
     */
    public function sendMessageWithInlineKeyboard(
        int $chatId,
        string $text,
        array $keyboard,
        array $options = []
    ): array {
        return $this->request('sendMessage', array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'reply_markup' => json_encode([
                'inline_keyboard' => $keyboard,
            ]),
        ], $options));
    }

    /**
     * Set webhook URL.
     */
    public function setWebhook(string $url): array
    {
        return $this->request('setWebhook', [
            'url' => $url,
        ]);
    }

    /**
     * Get webhook info.
     */
    public function getWebhookInfo(): array
    {
        return $this->request('getWebhookInfo');
    }
}
