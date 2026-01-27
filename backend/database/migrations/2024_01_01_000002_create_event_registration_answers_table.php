<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for the event_registration_answers table.
 *
 * Note: Based on the prompt, this table already exists in your database.
 * This migration is provided for reference and for new installations.
 *
 * If the table already exists, you can skip this migration or rename it
 * with a comment to indicate it's for documentation purposes only.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_registration_answers', function (Blueprint $table) {
            // Primary key as string (UUID)
            $table->uuid('id')->primary();

            // Foreign key to registrations table
            $table->string('registration_id');
            $table->foreign('registration_id')
                ->references('id')
                ->on('registrations')
                ->onDelete('cascade');

            // Foreign key to event_registration_questions table
            $table->uuid('question_id');
            $table->foreign('question_id')
                ->references('id')
                ->on('event_registration_questions')
                ->onDelete('cascade');

            // The answer text (supports long answers)
            $table->text('answer_text')->nullable();

            // Only created_at timestamp (no updated_at per schema)
            $table->timestamp('created_at')->nullable();

            // Indexes for faster queries
            $table->index('registration_id');
            $table->index('question_id');

            // Unique constraint to prevent duplicate answers
            $table->unique(['registration_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registration_answers');
    }
};
