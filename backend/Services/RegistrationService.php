<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventRegistrationAnswer;
use App\Models\EventRegistrationQuestion;
use App\Models\Registration;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function __construct(
        protected RegistrationAnswerService $answerService
    ) {}

    /**
     * Create a registration with optional custom question answers.
     *
     * This method should be integrated into your existing registration flow.
     * It uses a database transaction to ensure both the registration and answers
     * are created atomically.
     *
     * @param string $eventId The event ID
     * @param string $attendeeId The attendee ID
     * @param array $registrationData Registration data (pass_type_id, discount_code, etc.)
     * @param array $answers Array of answers: [['question_id' => 'xxx', 'answer' => 'yyy'], ...]
     * @return Registration The created registration
     */
    public function createRegistrationWithAnswers(
        string $eventId,
        string $attendeeId,
        array $registrationData,
        array $answers = []
    ): Registration {
        return DB::transaction(function () use ($eventId, $attendeeId, $registrationData, $answers) {
            // Create the registration (this should integrate with your existing logic)
            $registration = $this->createRegistration($eventId, $attendeeId, $registrationData);

            // Store answers if provided
            if (!empty($answers)) {
                $this->answerService->storeAnswers($registration->id, $answers);
            }

            return $registration;
        });
    }

    /**
     * Create the registration record.
     *
     * NOTE: This is a simplified implementation.
     * You should replace this with your actual registration creation logic,
     * which may include:
     * - Validating pass type availability
     * - Applying discount codes
     * - Creating related records (tickets, etc.)
     * - Sending notifications
     */
    protected function createRegistration(
        string $eventId,
        string $attendeeId,
        array $data
    ): Registration {
        // Generate a unique registration ID
        $registrationId = $this->generateRegistrationId();

        // Create the registration
        return Registration::create([
            'event_id' => $eventId,
            'primary_attendee_id' => $attendeeId,
            'pass_type_id' => $data['pass_type_id'],
            'registration_id' => $registrationId,
            'status' => 'pending',
            'is_primary' => true,
            'is_complete' => false,
            // Add other fields as needed
        ]);
    }

    /**
     * Generate a unique registration ID.
     */
    protected function generateRegistrationId(): string
    {
        // Generate format: WHISPR-XXXXXX
        do {
            $id = 'WHISPR-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        } while (Registration::where('registration_id', $id)->exists());

        return $id;
    }

    /**
     * Get registration details including answers.
     */
    public function getRegistrationWithAnswers(string $registrationId): array
    {
        $registration = Registration::with([
            'event',
            'passType',
            'primaryAttendee',
            'linkedAttendees',
        ])->findOrFail($registrationId);

        $answers = $this->answerService->formatAnswersForResponse($registrationId);

        return [
            'registration' => $registration,
            'answers' => $answers,
        ];
    }

    /**
     * Validate that all required questions for an event are answered.
     *
     * @param string $eventId The event ID
     * @param array $answers Array of answers: [['question_id' => 'xxx', 'answer' => 'yyy'], ...]
     * @return array Array of validation errors, empty if valid
     */
    public function validateRequiredQuestions(string $eventId, array $answers): array
    {
        $errors = [];

        // Get all required questions for this event
        $requiredQuestions = EventRegistrationQuestion::where('event_id', $eventId)
            ->where('is_required', true)
            ->get();

        // Create a map of provided answers
        $answeredQuestions = collect($answers)
            ->filter(fn ($a) => !empty($a['question_id']))
            ->keyBy('question_id');

        foreach ($requiredQuestions as $question) {
            $answer = $answeredQuestions->get($question->id);

            if (!$answer || empty(trim($answer['answer'] ?? ''))) {
                $errors[$question->id] = "The question \"{$question->question_text}\" is required.";
            }
        }

        return $errors;
    }
}
