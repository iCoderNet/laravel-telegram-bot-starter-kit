<?php

use App\Http\Controllers\Telegram\TelegramWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Telegram Bot Webhook Routes
|--------------------------------------------------------------------------
|
| Telegram bot webhook uchun routes.
| Bu routes CSRF tokendan mustasno qilingan (bootstrap/app.php da).
|
*/

Route::prefix('telegram')->name('telegram.')->group(function () {
    // Webhook endpoint
    Route::post('/webhook', [TelegramWebhookController::class, 'handle'])
        ->name('webhook');
});
