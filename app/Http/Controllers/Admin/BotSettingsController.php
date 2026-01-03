<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TelegramBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class BotSettingsController extends Controller
{
    public function __construct(
        protected TelegramBotService $telegramService
    ) {
    }

    /**
     * Display bot settings page.
     */
    public function index(): Response
    {
        return Inertia::render('admin/bot-settings', [
            'currentToken' => $this->getMaskedToken(),
            'webhookUrl' => config('services.telegram.webhook_url'),
            'defaultWebhookUrl' => route('telegram.webhook'),
        ]);
    }

    /**
     * Get bot status from Telegram API.
     */
    public function getStatus(): JsonResponse
    {
        $response = $this->telegramService->request('getMe');

        if (!$response['ok']) {
            return response()->json([
                'success' => false,
                'error' => $response['description'] ?? 'Failed to get bot info',
            ]);
        }

        return response()->json([
            'success' => true,
            'bot' => $response['result'],
        ]);
    }

    /**
     * Get webhook info from Telegram API.
     */
    public function getWebhookInfo(): JsonResponse
    {
        $response = $this->telegramService->getWebhookInfo();

        if (!$response['ok']) {
            return response()->json([
                'success' => false,
                'error' => $response['description'] ?? 'Failed to get webhook info',
            ]);
        }

        return response()->json([
            'success' => true,
            'webhook' => $response['result'],
        ]);
    }

    /**
     * Update bot token.
     */
    public function updateToken(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string|min:40',
        ]);

        // Update .env file
        $this->updateEnvValue('TELEGRAM_BOT_TOKEN', $request->token);

        return redirect()->back()->with('success', 'Bot token updated successfully');
    }

    /**
     * Set webhook URL.
     */
    public function setWebhook(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $response = $this->telegramService->setWebhook($request->url);

        if (!$response['ok']) {
            return response()->json([
                'success' => false,
                'error' => $response['description'] ?? 'Failed to set webhook',
            ]);
        }

        // Update .env file
        $this->updateEnvValue('TELEGRAM_WEBHOOK_URL', $request->url);

        return response()->json([
            'success' => true,
            'message' => 'Webhook set successfully',
        ]);
    }

    /**
     * Delete webhook.
     */
    public function deleteWebhook(): JsonResponse
    {
        $response = $this->telegramService->request('deleteWebhook');

        if (!$response['ok']) {
            return response()->json([
                'success' => false,
                'error' => $response['description'] ?? 'Failed to delete webhook',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook deleted successfully',
        ]);
    }

    /**
     * Get masked token for display.
     */
    protected function getMaskedToken(): string
    {
        $token = config('services.telegram.bot_token');

        if (empty($token)) {
            return '';
        }

        $length = strlen($token);
        if ($length <= 10) {
            return str_repeat('*', $length);
        }

        return substr($token, 0, 5) . str_repeat('*', $length - 10) . substr($token, -5);
    }

    /**
     * Update .env file value.
     */
    protected function updateEnvValue(string $key, string $value): void
    {
        $envFile = base_path('.env');
        $content = file_get_contents($envFile);

        if (str_contains($content, "{$key}=")) {
            $content = preg_replace(
                "/^{$key}=.*/m",
                "{$key}={$value}",
                $content
            );
        } else {
            $content .= "\n{$key}={$value}";
        }

        file_put_contents($envFile, $content);
    }
}
