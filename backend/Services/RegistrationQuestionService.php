<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventRegistrationQuestion;
use Illuminate\Support\Facades\DB;

class RegistrationQuestionService
{
    /**
     * Get all questions for an event ordered by order_index.
     */
    public function getQuestionsForEvent(string $eventId): \Illuminate\Database\Eloquent\Collection
    {
        return EventRegistrationQuestion::where('event_id', $eventId)
            ->ordered()
            ->get();
    }

    /**
     * Create a new registration question for an event.
     */
    public function createQuestion(string $eventId, array $data): EventRegistrationQuestion
    {
        // If no order_index provided, set it to the next available index
        if (!isset($data['order_index'])) {
            $maxOrder = EventRegistrationQuestion::where('event_id', $eventId)
                ->max('order_index');
            $data['order_index'] = ($maxOrder ?? -1) + 1;
        }

        return EventRegistrationQuestion::create([
            'event_id' => $eventId,
            'question_text' => $data['question_text'],
            'question_type' => $data['question_type'],
            'is_required' => $data['is_required'] ?? false,
            'options_json' => $data['options_json'] ?? null,
            'order_index' => $data['order_index'],
        ]);
    }

    /**
     * Update an existing registration question.
     */
    public function updateQuestion(EventRegistrationQuestion $question, array $data): EventRegistrationQuestion
    {
        $updateData = [];

        if (isset($data['question_text'])) {
            $updateData['question_text'] = $data['question_text'];
        }

        if (isset($data['question_type'])) {
            $updateData['question_type'] = $data['question_type'];
        }

        if (isset($data['is_required'])) {
            $updateData['is_required'] = $data['is_required'];
        }

        if (array_key_exists('options_json', $data)) {
            $updateData['options_json'] = $data['options_json'];
        }

        if (isset($data['order_index'])) {
            $updateData['order_index'] = $data['order_index'];
        }

        $question->update($updateData);

        return $question->fresh();
    }

    /**
     * Delete a registration question.
     */
    public function deleteQuestion(EventRegistrationQuestion $question): bool
    {
        return $question->delete();
    }

    /**
     * Reorder questions for an event.
     */
    public function reorderQuestions(string $eventId, array $questions): bool
    {
        return DB::transaction(function () use ($eventId, $questions) {
            foreach ($questions as $questionData) {
                EventRegistrationQuestion::where('id', $questionData['id'])
                    ->where('event_id', $eventId)
                    ->update(['order_index' => $questionData['order_index']]);
            }

            return true;
        });
    }

    /**
     * Verify that a question belongs to a specific event.
     */
    public function questionBelongsToEvent(string $questionId, string $eventId): bool
    {
        return EventRegistrationQuestion::where('id', $questionId)
            ->where('event_id', $eventId)
            ->exists();
    }

    /**
     * Verify that the organizer owns the event.
     */
    public function organizerOwnsEvent(string $organizerId, string $eventId): bool
    {
        return Event::where('id', $eventId)
            ->where('organization_id', function ($query) use ($organizerId) {
                $query->select('organization_id')
                    ->from('organizers')
                    ->where('id', $organizerId);
            })
            ->exists();
    }
}
