<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BotCommand;
use App\Models\TelegramUser;
use App\Services\TelegramBotService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected TelegramBotService $telegramService
    ) {
    }

    /**
     * Admin dashboard with stats.
     */
    public function index(): Response
    {
        $stats = [
            'totalUsers' => TelegramUser::count(),
            'activeUsers' => TelegramUser::active()->count(),
            'blockedUsers' => TelegramUser::blocked()->count(),
            'totalCommands' => BotCommand::count(),
            'activeCommands' => BotCommand::active()->count(),
            'botConfigured' => $this->telegramService->isConfigured(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }
}
