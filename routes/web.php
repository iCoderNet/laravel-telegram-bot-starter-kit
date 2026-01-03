<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Redirect old dashboard to admin dashboard
Route::middleware(['auth', 'verified'])->group(function () {
    //
});

require __DIR__ . '/settings.php';
