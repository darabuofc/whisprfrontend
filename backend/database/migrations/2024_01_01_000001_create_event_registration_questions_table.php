<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for the event_registration_questions table.
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
        Schema::create('event_registration_questions', function (Blueprint $table) {
            // Primary key as string (UUID)
            $table->uuid('id')->primary();

            // Foreign key to events table
            $table->string('event_id');
            $table->foreign('event_id')
                ->references('id')
                ->on('events')
                ->onDelete('cascade');

            // Question text
            $table->string('question_text', 500);

            // Question type enum
            $table->enum('question_type', [
                'text',
                'textarea',
                'select',
                'multiselect',
                'checkbox',
                'yesno',
                'number',
                'file',
            ]);

            // Is the question required?
            $table->boolean('is_required')->default(false);

            // Options for select/multiselect (stored as JSON string)
            $table->json('options_json')->nullable();

            // Order index for sorting questions
            $table->integer('order_index')->default(0);

            // Timestamps
            $table->timestamps();

            // Indexes for faster queries
            $table->index(['event_id', 'order_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registration_questions');
    }
};
