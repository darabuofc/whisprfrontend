<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistrationQuestion;
use App\Services\RegistrationQuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventRegistrationQuestionController extends Controller
{
    public function __construct(
        protected RegistrationQuestionService $questionService
    ) {}

    /**
     * GET /api/events/{eventId}/registration-questions
     *
     * Get all registration questions for an event (public/attendee endpoint).
     * Returns questions ordered by order_index.
     */
    public function index(Request $request, string $eventId): JsonResponse
    {
        // Verify event exists and is published
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found.',
            ], 404);
        }

        // Optional: Check if event is published (uncomment if needed)
        // if ($event->status !== 'published') {
        //     return response()->json([
        //         'message' => 'Event is not available.',
        //     ], 404);
        // }

        $questions = $this->questionService->getQuestionsForEvent($eventId);

        return response()->json([
            'message' => 'Registration questions retrieved successfully.',
            'questions' => $questions->map(fn ($q) => $this->formatQuestionForAttendee($q)),
        ]);
    }

    /**
     * Format a question for attendee API response.
     * Excludes some internal fields that attendees don't need.
     */
    protected function formatQuestionForAttendee(EventRegistrationQuestion $question): array
    {
        return [
            'id' => $question->id,
            'question_text' => $question->question_text,
            'question_type' => $question->question_type,
            'is_required' => $question->is_required,
            'options' => $question->options_json,
            'order_index' => $question->order_index,
        ];
    }
}
