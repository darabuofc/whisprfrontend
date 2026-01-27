<?php

namespace App\Services;

use App\Models\EventRegistrationAnswer;
use App\Models\EventRegistrationQuestion;
use Illuminate\Support\Facades\DB;

class RegistrationAnswerService
{
    /**
     * Store answers for a registration.
     *
     * @param string $registrationId The registration ID
     * @param array $answers Array of answers in format: [['question_id' => 'xxx', 'answer' => 'yyy'], ...]
     * @return \Illuminate\Support\Collection The created answers
     */
    public function storeAnswers(string $registrationId, array $answers): \Illuminate\Support\Collection
    {
        return DB::transaction(function () use ($registrationId, $answers) {
            $createdAnswers = collect();

            foreach ($answers as $answerData) {
                if (empty($answerData['question_id'])) {
                    continue;
                }

                // Normalize the answer value
                $answerText = $this->normalizeAnswerValue(
                    $answerData['answer'] ?? '',
                    $answerData['question_id']
                );

                $answer = EventRegistrationAnswer::create([
                    'registration_id' => $registrationId,
                    'question_id' => $answerData['question_id'],
                    'answer_text' => $answerText,
                ]);

                $createdAnswers->push($answer);
            }

            return $createdAnswers;
        });
    }

    /**
     * Normalize answer value based on question type.
     */
    protected function normalizeAnswerValue(string $answer, string $questionId): string
    {
        $question = EventRegistrationQuestion::find($questionId);
        if (!$question) {
            return $answer;
        }

        switch ($question->question_type) {
            case 'multiselect':
                // If already JSON, keep it; otherwise try to parse as comma-separated
                if (!$this->isJson($answer)) {
                    $values = array_map('trim', explode(',', $answer));
                    return json_encode($values);
                }
                return $answer;

            case 'checkbox':
            case 'yesno':
                // Normalize boolean-like values
                $normalized = strtolower(trim($answer));
                if (in_array($normalized, ['yes', '1', 'true', 'checked'])) {
                    return 'yes';
                } elseif (in_array($normalized, ['no', '0', 'false', 'unchecked'])) {
                    return 'no';
                }
                return $answer;

            case 'number':
                // Ensure numeric format
                return is_numeric($answer) ? (string) $answer : $answer;

            default:
                return $answer;
        }
    }

    /**
     * Check if a string is valid JSON.
     */
    protected function isJson(string $string): bool
    {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * Get answers for a registration.
     */
    public function getAnswersForRegistration(string $registrationId): \Illuminate\Database\Eloquent\Collection
    {
        return EventRegistrationAnswer::where('registration_id', $registrationId)
            ->with('question')
            ->get();
    }

    /**
     * Format answers for API response.
     */
    public function formatAnswersForResponse(string $registrationId): array
    {
        $answers = $this->getAnswersForRegistration($registrationId);

        return $answers->map(function ($answer) {
            return [
                'id' => $answer->id,
                'question_id' => $answer->question_id,
                'question_text' => $answer->question?->question_text,
                'question_type' => $answer->question?->question_type,
                'answer' => $this->formatAnswerForDisplay($answer),
                'created_at' => $answer->created_at?->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Format a single answer for display.
     */
    protected function formatAnswerForDisplay(EventRegistrationAnswer $answer): mixed
    {
        $questionType = $answer->question?->question_type;

        switch ($questionType) {
            case 'multiselect':
                // Return as array if JSON
                if ($this->isJson($answer->answer_text)) {
                    return json_decode($answer->answer_text, true);
                }
                return $answer->answer_text;

            case 'checkbox':
            case 'yesno':
                return $answer->answer_text === 'yes';

            case 'number':
                return is_numeric($answer->answer_text) ? (float) $answer->answer_text : $answer->answer_text;

            default:
                return $answer->answer_text;
        }
    }
}
