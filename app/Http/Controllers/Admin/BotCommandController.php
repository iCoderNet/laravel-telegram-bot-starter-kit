<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BotCommand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BotCommandController extends Controller
{
    /**
     * Display a listing of commands.
     */
    public function index(): Response
    {
        $commands = BotCommand::orderBy('created_at', 'desc')->get()->map(function ($command) {
            if ($command->hasMedia()) {
                $command->media_url = $command->getMediaUrl();
            }
            return $command;
        });

        return Inertia::render('admin/commands/index', [
            'commands' => $commands,
        ]);
    }

    /**
     * Show the form for creating a new command.
     */
    public function create(): Response
    {
        return Inertia::render('admin/commands/form', [
            'command' => null,
        ]);
    }

    /**
     * Store a newly created command.
     */
    public function store(Request $request): RedirectResponse
    {
        // Parse buttons from JSON string if needed
        $this->parseButtonsFromJson($request);

        $validated = $request->validate([
            'trigger' => 'required|string|max:255',
            'trigger_type' => 'required|in:command,text',
            'response' => 'required|string',
            'parse_mode' => 'required|in:none,HTML,Markdown,MarkdownV2',
            'media_type' => 'required|in:none,photo,video,audio,voice,document',
            'media' => 'nullable|file|max:20480',
            'buttons' => 'nullable|array',
            'is_active' => 'nullable',
        ]);

        // Handle file upload
        $mediaPath = null;
        if ($request->hasFile('media') && $validated['media_type'] !== 'none') {
            $mediaPath = $request->file('media')->store('bot-media', 'public');
        }

        BotCommand::create([
            'trigger' => $validated['trigger'],
            'trigger_type' => $validated['trigger_type'],
            'response' => $validated['response'],
            'parse_mode' => $validated['parse_mode'],
            'media_type' => $validated['media_type'],
            'media_path' => $mediaPath,
            'buttons' => $validated['buttons'] ?? [],
            'is_active' => $this->parseBoolean($validated['is_active'] ?? true),
        ]);

        return redirect()
            ->route('admin.commands.index')
            ->with('success', 'Command created successfully');
    }

    /**
     * Show the form for editing the specified command.
     */
    public function edit(BotCommand $command): Response
    {
        if ($command->hasMedia()) {
            $command->media_url = $command->getMediaUrl();
        }

        return Inertia::render('admin/commands/form', [
            'command' => $command,
        ]);
    }

    /**
     * Update the specified command.
     */
    public function update(Request $request, BotCommand $command): RedirectResponse
    {
        // Parse buttons from JSON string if needed
        $this->parseButtonsFromJson($request);

        $validated = $request->validate([
            'trigger' => 'required|string|max:255',
            'trigger_type' => 'required|in:command,text',
            'response' => 'required|string',
            'parse_mode' => 'required|in:none,HTML,Markdown,MarkdownV2',
            'media_type' => 'required|in:none,photo,video,audio,voice,document',
            'media' => 'nullable|file|max:20480',
            'remove_media' => 'nullable',
            'buttons' => 'nullable|array',
            'is_active' => 'nullable',
        ]);

        $updateData = [
            'trigger' => $validated['trigger'],
            'trigger_type' => $validated['trigger_type'],
            'response' => $validated['response'],
            'parse_mode' => $validated['parse_mode'],
            'media_type' => $validated['media_type'],
            'buttons' => $validated['buttons'] ?? [],
            'is_active' => $this->parseBoolean($validated['is_active'] ?? true),
        ];

        // Handle media removal
        if ($this->parseBoolean($request->input('remove_media')) || $validated['media_type'] === 'none') {
            if ($command->hasMedia()) {
                Storage::disk('public')->delete($command->media_path);
            }
            $updateData['media_path'] = null;
            if ($validated['media_type'] === 'none') {
                $updateData['media_type'] = 'none';
            }
        }

        // Handle new file upload
        if ($request->hasFile('media') && $validated['media_type'] !== 'none') {
            // Delete old media
            if ($command->hasMedia()) {
                Storage::disk('public')->delete($command->media_path);
            }
            $updateData['media_path'] = $request->file('media')->store('bot-media', 'public');
        }

        $command->update($updateData);

        return redirect()
            ->route('admin.commands.index')
            ->with('success', 'Command updated successfully');
    }

    /**
     * Remove the specified command.
     */
    public function destroy(BotCommand $command): RedirectResponse
    {
        // Delete associated media
        if ($command->hasMedia()) {
            Storage::disk('public')->delete($command->media_path);
        }

        $command->delete();

        return redirect()
            ->route('admin.commands.index')
            ->with('success', 'Command deleted successfully');
    }

    /**
     * Toggle command active status.
     */
    public function toggle(BotCommand $command): RedirectResponse
    {
        $command->update(['is_active' => !$command->is_active]);

        return redirect()->back()->with('success', 'Command status updated');
    }

    /**
     * Parse buttons from JSON string if sent via FormData.
     */
    protected function parseButtonsFromJson(Request $request): void
    {
        $buttons = $request->input('buttons');

        if (is_string($buttons)) {
            $decoded = json_decode($buttons, true);
            $request->merge(['buttons' => is_array($decoded) ? $decoded : []]);
        }
    }

    /**
     * Parse boolean value from various formats.
     */
    protected function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array(strtolower($value), ['1', 'true', 'on', 'yes']);
        }

        return (bool) $value;
    }
}
