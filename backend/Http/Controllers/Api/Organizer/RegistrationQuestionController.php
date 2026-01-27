<?php

namespace App\Http\Controllers\Api\Organizer;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderRegistrationQuestionsRequest;
use App\Http\Requests\StoreRegistrationQuestionRequest;
use App\Http\Requests\UpdateRegistrationQuestionRequest;
use App\Models\Event;
use App\Models\EventRegistrationQuestion;
use App\Services\RegistrationQuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationQuestionController extends Controller
{
    public function __construct(
        protected RegistrationQuestionService $questionService
    ) {}

    /**
     * GET /api/organizer/events/{eventId}/registration-questions
     *
     * Get all registration questions for an event.
     */
    public function index(Request $request, string $eventId): JsonResponse
    {
        // Verify organizer owns the event
        $organizer = $request->user();
        if (!$this->questionService->organizerOwnsEvent($organizer->id, $eventId)) {
            return response()->json([
                'message' => 'Event not found or you do not have access to it.',
            ], 404);
        }

        $questions = $this->questionService->getQuestionsForEvent($eventId);

        return response()->json([
            'message' => 'Registration questions retrieved successfully.',
            'questions' => $questions->map(fn ($q) => $this->formatQuestion($q)),
        ]);
    }

    /**
     * POST /api/organizer/events/{eventId}/registration-questions
     *
     * Create a new registration question for an event.
     */
    public function store(StoreRegistrationQuestionRequest $request, string $eventId): JsonResponse
    {
        // Verify organizer owns the event
        $organizer = $request->user();
        if (!$this->questionService->organizerOwnsEvent($organizer->id, $eventId)) {
            return response()->json([
                'message' => 'Event not found or you do not have access to it.',
            ], 404);
        }

        $question = $this->questionService->createQuestion($eventId, $request->validated());

        return response()->json([
            'message' => 'Registration question created successfully.',
            'question' => $this->formatQuestion($question),
        ], 201);
    }

    /**
     * PUT /api/organizer/registration-questions/{id}
     *
     * Update a registration question.
     */
    public function update(UpdateRegistrationQuestionRequest $request, string $id): JsonResponse
    {
        $question = EventRegistrationQuestion::find($id);

        if (!$question) {
            return response()->json([
                'message' => 'Registration question not found.',
            ], 404);
        }

        // Verify organizer owns the event that contains this question
        $organizer = $request->user();
        if (!$this->questionService->organizerOwnsEvent($organizer->id, $question->event_id)) {
            return response()->json([
                'message' => 'You do not have permission to update this question.',
            ], 403);
        }

        $updatedQuestion = $this->questionService->updateQuestion($question, $request->validated());

        return response()->json([
            'message' => 'Registration question updated successfully.',
            'question' => $this->formatQuestion($updatedQuestion),
        ]);
    }

    /**
     * DELETE /api/organizer/registration-questions/{id}
     *
     * Delete a registration question.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $question = EventRegistrationQuestion::find($id);

        if (!$question) {
            return response()->json([
                'message' => 'Registration question not found.',
            ], 404);
        }

        // Verify organizer owns the event that contains this question
        $organizer = $request->user();
        if (!$this->questionService->organizerOwnsEvent($organizer->id, $question->event_id)) {
            return response()->json([
                'message' => 'You do not have permission to delete this question.',
            ], 403);
        }

        $this->questionService->deleteQuestion($question);

        return response()->json([
            'message' => 'Registration question deleted successfully.',
        ]);
    }

    /**
     * POST /api/organizer/events/{eventId}/registration-questions/reorder
     *
     * Reorder registration questions for an event.
     */
    public function reorder(ReorderRegistrationQuestionsRequest $request, string $eventId): JsonResponse
    {
        // Verify organizer owns the event
        $organizer = $request->user();
        if (!$this->questionService->organizerOwnsEvent($organizer->id, $eventId)) {
            return response()->json([
                'message' => 'Event not found or you do not have access to it.',
            ], 404);
        }

        // Verify all questions belong to this event
        $questionIds = collect($request->input('questions'))->pluck('id')->toArray();
        $validCount = EventRegistrationQuestion::where('event_id', $eventId)
            ->whereIn('id', $questionIds)
            ->count();

        if ($validCount !== count($questionIds)) {
            return response()->json([
                'message' => 'One or more questions do not belong to this event.',
            ], 400);
        }

        $this->questionService->reorderQuestions($eventId, $request->input('questions'));

        // Return updated questions
        $questions = $this->questionService->getQuestionsForEvent($eventId);

        return response()->json([
            'message' => 'Questions reordered successfully.',
            'questions' => $questions->map(fn ($q) => $this->formatQuestion($q)),
        ]);
    }

    /**
     * Format a question for API response.
     */
    protected function formatQuestion(EventRegistrationQuestion $question): array
    {
        return [
            'id' => $question->id,
            'event_id' => $question->event_id,
            'question_text' => $question->question_text,
            'question_type' => $question->question_type,
            'is_required' => $question->is_required,
            'options' => $question->options_json,
            'order_index' => $question->order_index,
            'created_at' => $question->created_at?->toIso8601String(),
        ];
    }
}
