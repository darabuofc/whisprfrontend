<?php

namespace App\Http\Requests;

use App\Models\Event;
use App\Models\EventRegistrationQuestion;
use Illuminate\Foundation\Http\FormRequest;

class StoreRegistrationWithAnswersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Existing registration fields
            'pass_type_id' => ['required', 'string'],
            'discount_code' => ['nullable', 'string'],

            // Custom question answers
            'answers' => ['sometimes', 'array'],
            'answers.*.question_id' => ['required_with:answers', 'string', 'exists:event_registration_questions,id'],
            'answers.*.answer' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $eventId = $this->route('eventId');
            $answers = $this->input('answers', []);

            // Get all required questions for this event
            $requiredQuestions = EventRegistrationQuestion::where('event_id', $eventId)
                ->where('is_required', true)
                ->get();

            // Create a map of provided answers
            $answeredQuestionIds = collect($answers)->pluck('question_id')->toArray();

            // Check that all required questions are answered
            foreach ($requiredQuestions as $question) {
                if (!in_array($question->id, $answeredQuestionIds)) {
                    $validator->errors()->add(
                        "answers.{$question->id}",
                        "The question \"{$question->question_text}\" is required."
                    );
                    continue;
                }

                // Find the answer for this question
                $answer = collect($answers)->firstWhere('question_id', $question->id);

                if ($answer && (empty($answer['answer']) || trim($answer['answer']) === '')) {
                    $validator->errors()->add(
                        "answers.{$question->id}",
                        "The question \"{$question->question_text}\" is required."
                    );
                }
            }

            // Validate that answers belong to the correct event
            $providedQuestionIds = collect($answers)->pluck('question_id')->filter()->toArray();
            if (!empty($providedQuestionIds)) {
                $validQuestionIds = EventRegistrationQuestion::where('event_id', $eventId)
                    ->whereIn('id', $providedQuestionIds)
                    ->pluck('id')
                    ->toArray();

                $invalidIds = array_diff($providedQuestionIds, $validQuestionIds);
                if (!empty($invalidIds)) {
                    $validator->errors()->add(
                        'answers',
                        'One or more question IDs do not belong to this event.'
                    );
                }
            }

            // Validate answer format based on question type
            foreach ($answers as $index => $answerData) {
                if (empty($answerData['question_id'])) {
                    continue;
                }

                $question = EventRegistrationQuestion::find($answerData['question_id']);
                if (!$question) {
                    continue;
                }

                $answerValue = $answerData['answer'] ?? '';

                // Validate based on question type
                switch ($question->question_type) {
                    case 'number':
                        if (!empty($answerValue) && !is_numeric($answerValue)) {
                            $validator->errors()->add(
                                "answers.{$index}.answer",
                                "The answer for \"{$question->question_text}\" must be a number."
                            );
                        }
                        break;

                    case 'select':
                        if (!empty($answerValue)) {
                            $options = $question->options_json ?? [];
                            if (!in_array($answerValue, $options)) {
                                $validator->errors()->add(
                                    "answers.{$index}.answer",
                                    "Invalid option selected for \"{$question->question_text}\"."
                                );
                            }
                        }
                        break;

                    case 'multiselect':
                        if (!empty($answerValue)) {
                            $selectedOptions = json_decode($answerValue, true);
                            if (!is_array($selectedOptions)) {
                                $selectedOptions = explode(',', $answerValue);
                            }
                            $options = $question->options_json ?? [];
                            foreach ($selectedOptions as $selected) {
                                if (!in_array(trim($selected), $options)) {
                                    $validator->errors()->add(
                                        "answers.{$index}.answer",
                                        "Invalid option selected for \"{$question->question_text}\"."
                                    );
                                    break;
                                }
                            }
                        }
                        break;

                    case 'yesno':
                        if (!empty($answerValue) && !in_array(strtolower($answerValue), ['yes', 'no', '1', '0', 'true', 'false'])) {
                            $validator->errors()->add(
                                "answers.{$index}.answer",
                                "The answer for \"{$question->question_text}\" must be yes or no."
                            );
                        }
                        break;

                    case 'checkbox':
                        if (!empty($answerValue) && !in_array(strtolower($answerValue), ['1', '0', 'true', 'false', 'checked', 'unchecked'])) {
                            $validator->errors()->add(
                                "answers.{$index}.answer",
                                "Invalid checkbox value for \"{$question->question_text}\"."
                            );
                        }
                        break;
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'pass_type_id.required' => 'A pass type is required.',
            'answers.array' => 'Answers must be provided as an array.',
            'answers.*.question_id.required_with' => 'Each answer must have a question ID.',
            'answers.*.question_id.exists' => 'Invalid question ID provided.',
            'answers.*.answer.max' => 'Answer cannot exceed 5000 characters.',
        ];
    }
}
