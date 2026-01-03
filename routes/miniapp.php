<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Mini APP Routes
|--------------------------------------------------------------------------
|
| Telegram Mini APP uchun routes.
| Bu routes authentication talab qilmaydi (Telegram orqali auth).
|
| Mini APP sahifalari: /miniapp/* URL larda joylashadi
|
*/

Route::prefix('miniapp')->name('miniapp.')->group(function () {
    // Asosiy sahifa
    Route::get('/', fn() => Inertia::render('miniapp/index'))->name('index');

    // Boshqa Mini APP routes shu yerga qo'shiladi
    // Route::get('/profile', fn () => Inertia::render('miniapp/profile'))->name('profile');
    // Route::get('/settings', fn () => Inertia::render('miniapp/settings'))->name('settings');
});
