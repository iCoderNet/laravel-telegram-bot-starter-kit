<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bot_commands', function (Blueprint $table) {
            $table->enum('parse_mode', ['none', 'HTML', 'Markdown', 'MarkdownV2'])
                ->default('none')
                ->after('response');

            $table->enum('media_type', ['none', 'photo', 'video', 'audio', 'voice', 'document'])
                ->default('none')
                ->after('parse_mode');

            $table->string('media_path')->nullable()->after('media_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_commands', function (Blueprint $table) {
            $table->dropColumn(['parse_mode', 'media_type', 'media_path']);
        });
    }
};
