<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TelegramUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TelegramUserController extends Controller
{
    /**
     * Display a listing of telegram users.
     */
    public function index(Request $request): Response
    {
        $users = TelegramUser::query()
            ->search($request->search)
            ->when($request->status === 'blocked', fn($q) => $q->blocked())
            ->when($request->status === 'active', fn($q) => $q->active())
            ->orderBy('last_activity_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/telegram-users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(TelegramUser $telegramUser): Response
    {
        return Inertia::render('admin/telegram-users/show', [
            'user' => $telegramUser,
        ]);
    }

    /**
     * Update the specified user (block/unblock).
     */
    public function update(Request $request, TelegramUser $telegramUser): RedirectResponse
    {
        $validated = $request->validate([
            'is_blocked' => 'sometimes|boolean',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|nullable|string|max:255',
        ]);

        $telegramUser->update($validated);

        $message = isset($validated['is_blocked'])
            ? ($validated['is_blocked'] ? 'User blocked successfully' : 'User unblocked successfully')
            : 'User updated successfully';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(TelegramUser $telegramUser): RedirectResponse
    {
        $telegramUser->delete();

        return redirect()
            ->route('admin.telegram-users.index')
            ->with('success', 'User deleted successfully');
    }

    /**
     * Toggle user blocked status.
     */
    public function toggle(TelegramUser $telegramUser): RedirectResponse
    {
        $telegramUser->update(['is_blocked' => !$telegramUser->is_blocked]);

        $message = $telegramUser->is_blocked
            ? 'User blocked successfully'
            : 'User unblocked successfully';

        return redirect()->back()->with('success', $message);
    }
}
