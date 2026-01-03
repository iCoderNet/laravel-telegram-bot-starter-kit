<?php

use App\Http\Controllers\Admin\BotCommandController;
use App\Http\Controllers\Admin\BotSettingsController;
use App\Http\Controllers\Admin\BroadcastController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TelegramUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| All admin panel routes are located here.
| Prefix: /admin
| Middleware: auth, verified
|
*/

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Bot Settings
    Route::get('/bot-settings', [BotSettingsController::class, 'index'])->name('bot-settings');
    Route::post('/bot-settings/token', [BotSettingsController::class, 'updateToken'])->name('bot-settings.token');
    Route::get('/bot-settings/status', [BotSettingsController::class, 'getStatus'])->name('bot-settings.status');
    Route::get('/bot-settings/webhook-info', [BotSettingsController::class, 'getWebhookInfo'])->name('bot-settings.webhook-info');
    Route::post('/bot-settings/webhook', [BotSettingsController::class, 'setWebhook'])->name('bot-settings.webhook');
    Route::delete('/bot-settings/webhook', [BotSettingsController::class, 'deleteWebhook'])->name('bot-settings.webhook.delete');

    // Bot Commands
    Route::resource('commands', BotCommandController::class);
    Route::post('/commands/{command}/toggle', [BotCommandController::class, 'toggle'])->name('commands.toggle');

    // Telegram Users
    Route::get('/telegram-users', [TelegramUserController::class, 'index'])->name('telegram-users.index');
    Route::get('/telegram-users/{telegramUser}', [TelegramUserController::class, 'show'])->name('telegram-users.show');
    Route::patch('/telegram-users/{telegramUser}', [TelegramUserController::class, 'update'])->name('telegram-users.update');
    Route::delete('/telegram-users/{telegramUser}', [TelegramUserController::class, 'destroy'])->name('telegram-users.destroy');
    Route::post('/telegram-users/{telegramUser}/toggle', [TelegramUserController::class, 'toggle'])->name('telegram-users.toggle');

    // Broadcast Messages
    Route::get('/broadcast', [BroadcastController::class, 'index'])->name('broadcast.index');
    Route::get('/broadcast/create', [BroadcastController::class, 'create'])->name('broadcast.create');
    Route::post('/broadcast', [BroadcastController::class, 'store'])->name('broadcast.store');
    Route::get('/broadcast/search-users', [BroadcastController::class, 'searchUsers'])->name('broadcast.search-users');
    Route::get('/broadcast/{broadcast}', [BroadcastController::class, 'show'])->name('broadcast.show');
    Route::get('/broadcast/{broadcast}/progress', [BroadcastController::class, 'progress'])->name('broadcast.progress');
});
