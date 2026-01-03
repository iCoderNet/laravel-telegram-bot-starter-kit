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
        Schema::create('broadcast_messages', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->enum('parse_mode', ['none', 'HTML', 'Markdown', 'MarkdownV2'])->default('none');
            $table->enum('media_type', ['none', 'photo', 'video', 'audio', 'voice', 'document'])->default('none');
            $table->string('media_path')->nullable();
            $table->json('buttons')->nullable();
            $table->enum('recipient_type', ['all', 'selected'])->default('all');
            $table->json('recipient_ids')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcast_messages');
    }
};
