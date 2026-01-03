<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Models\BotCommand;
use App\Models\TelegramUser;
use App\Services\TelegramBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function __construct(
        protected TelegramBotService $telegramService
    ) {
    }

    /**
     * Handle Telegram webhook.
     */
    public function handle(Request $request): JsonResponse
    {
        $update = $request->all();

        // Check if message exists
        if (!isset($update['message'])) {
            return response()->json(['ok' => true]);
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';
        $from = $message['from'] ?? null;

        // Save or update user in database
        if ($from) {
            $user = TelegramUser::updateFromTelegram($from);

            // Check if user is blocked
            if ($user->is_blocked) {
                return response()->json(['ok' => true]);
            }
        }

        // Handle message
        $this->handleMessage($text, $chatId, $message);

        return response()->json(['ok' => true]);
    }

    /**
     * Handle incoming message.
     */
    protected function handleMessage(string $text, int $chatId, array $message): void
    {
        // Check for command type triggers
        if (str_starts_with($text, '/')) {
            $command = explode(' ', $text)[0];
            $command = explode('@', $command)[0];

            $botCommand = BotCommand::findByTrigger($command);

            if ($botCommand) {
                $this->sendCommandResponse($chatId, $botCommand, $message);
                return;
            }
        }

        // Check for text type triggers
        $textCommand = BotCommand::active()
            ->where('trigger_type', 'text')
            ->where('trigger', $text)
            ->first();

        if ($textCommand) {
            $this->sendCommandResponse($chatId, $textCommand, $message);
        }
    }

    /**
     * Send command response with optional media and buttons.
     */
    protected function sendCommandResponse(int $chatId, BotCommand $command, array $message): void
    {
        $firstName = $message['from']['first_name'] ?? 'User';

        // Replace placeholders in response
        $response = str_replace(
            ['{first_name}', '{username}', '{user_id}'],
            [
                $firstName,
                $message['from']['username'] ?? '',
                $message['from']['id'] ?? ''
            ],
            $command->response
        );

        // Build options
        $options = [];

        // Add parse mode if set
        $parseMode = $command->getTelegramParseMode();
        if ($parseMode) {
            $options['parse_mode'] = $parseMode;
        }

        // Add inline keyboard if buttons exist
        $keyboard = $command->getInlineKeyboard();
        if ($keyboard) {
            $options['reply_markup'] = json_encode([
                'inline_keyboard' => $keyboard,
            ]);
        }

        // Send based on media type
        if ($command->hasMedia()) {
            $mediaPath = $command->getMediaFullPath();

            // For media messages, use caption instead of text
            $options['caption'] = $response;
            if ($parseMode) {
                $options['parse_mode'] = $parseMode;
            }
            unset($options['text']);

            match ($command->media_type) {
                'photo' => $this->telegramService->sendPhoto($chatId, $mediaPath, $response, $options),
                'video' => $this->telegramService->sendVideo($chatId, $mediaPath, $response, $options),
                'audio' => $this->telegramService->sendAudio($chatId, $mediaPath, $response, $options),
                'voice' => $this->telegramService->sendVoice($chatId, $mediaPath, $response, $options),
                'document' => $this->telegramService->sendDocument($chatId, $mediaPath, $response, $options),
                default => $this->telegramService->sendMessage($chatId, $response, $options),
            };
        } else {
            $this->telegramService->sendMessage($chatId, $response, $options);
        }
    }
}
