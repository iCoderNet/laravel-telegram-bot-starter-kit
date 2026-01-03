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
        Schema::create('bot_commands', function (Blueprint $table) {
            $table->id();
            $table->string('trigger');                          // /start, /help, or text like "Hello"
            $table->enum('trigger_type', ['command', 'text'])->default('command');
            $table->text('response');                           // Response message
            $table->json('buttons')->nullable();                // Button configuration
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('trigger');
            $table->index('trigger_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_commands');
    }
};
