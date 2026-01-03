<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendBroadcastMessageJob;
use App\Models\BroadcastMessage;
use App\Models\TelegramUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BroadcastController extends Controller
{
    /**
     * Display list of broadcasts.
     */
    public function index(): Response
    {
        $broadcasts = BroadcastMessage::orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($broadcast) {
                $broadcast->progress = $broadcast->getProgressPercentage();
                if ($broadcast->hasMedia()) {
                    $broadcast->media_url = $broadcast->getMediaUrl();
                }
                return $broadcast;
            });

        $stats = [
            'total' => BroadcastMessage::count(),
            'pending' => BroadcastMessage::pending()->count(),
            'processing' => BroadcastMessage::processing()->count(),
            'completed' => BroadcastMessage::completed()->count(),
        ];

        return Inertia::render('admin/broadcast/index', [
            'broadcasts' => $broadcasts,
            'stats' => $stats,
        ]);
    }

    /**
     * Show create broadcast form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/broadcast/create', [
            'totalUsers' => TelegramUser::active()->count(),
        ]);
    }

    /**
     * Store and dispatch broadcast.
     */
    public function store(Request $request): RedirectResponse
    {
        // Parse buttons from JSON string if needed
        $buttons = $request->input('buttons');
        if (is_string($buttons)) {
            $buttons = json_decode($buttons, true) ?? [];
        }
        $request->merge(['buttons' => $buttons]);

        $validated = $request->validate([
            'message' => 'required|string',
            'parse_mode' => 'required|in:none,HTML,Markdown,MarkdownV2',
            'media_type' => 'required|in:none,photo,video,audio,voice,document',
            'media' => 'nullable|file|max:20480',
            'buttons' => 'nullable|array',
            'recipient_type' => 'required|in:all,selected',
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'exists:telegram_users,id',
        ]);

        // Handle file upload
        $mediaPath = null;
        if ($request->hasFile('media') && $validated['media_type'] !== 'none') {
            $mediaPath = $request->file('media')->store('broadcast-media', 'public');
        }

        // Get recipients
        if ($validated['recipient_type'] === 'all') {
            $recipients = TelegramUser::active()->get();
        } else {
            $recipients = TelegramUser::whereIn('id', $validated['recipient_ids'] ?? [])->get();
        }

        if ($recipients->isEmpty()) {
            return redirect()
                ->back()
                ->withErrors(['recipient_ids' => 'No recipients selected or no active users found.']);
        }

        // Create broadcast
        $broadcast = BroadcastMessage::create([
            'message' => $validated['message'],
            'parse_mode' => $validated['parse_mode'],
            'media_type' => $validated['media_type'],
            'media_path' => $mediaPath,
            'buttons' => $validated['buttons'] ?? [],
            'recipient_type' => $validated['recipient_type'],
            'recipient_ids' => $validated['recipient_type'] === 'selected'
                ? $validated['recipient_ids']
                : null,
            'status' => 'pending',
            'total_recipients' => $recipients->count(),
        ]);

        // Mark as processing and dispatch jobs
        $broadcast->markAsProcessing();

        foreach ($recipients as $user) {
            SendBroadcastMessageJob::dispatch($broadcast, $user)
                ->onQueue('broadcasts');
        }

        return redirect()
            ->route('admin.broadcast.show', $broadcast)
            ->with('success', 'Broadcast started! Sending to ' . $recipients->count() . ' users.');
    }

    /**
     * Show broadcast details.
     */
    public function show(BroadcastMessage $broadcast): Response
    {
        $broadcast->progress = $broadcast->getProgressPercentage();
        if ($broadcast->hasMedia()) {
            $broadcast->media_url = $broadcast->getMediaUrl();
        }

        return Inertia::render('admin/broadcast/show', [
            'broadcast' => $broadcast,
        ]);
    }

    /**
     * Search users for selection.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $search = $request->input('search', '');

        $users = TelegramUser::active()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('telegram_id', 'like', "%{$search}%");
                });
            })
            ->limit(20)
            ->get(['id', 'telegram_id', 'first_name', 'last_name', 'username']);

        return response()->json($users);
    }

    /**
     * Get broadcast progress (for polling).
     */
    public function progress(BroadcastMessage $broadcast): JsonResponse
    {
        return response()->json([
            'status' => $broadcast->status,
            'progress' => $broadcast->getProgressPercentage(),
            'sent_count' => $broadcast->sent_count,
            'failed_count' => $broadcast->failed_count,
            'total_recipients' => $broadcast->total_recipients,
        ]);
    }
}
