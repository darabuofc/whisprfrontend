<?php

namespace App\Http\Requests;

use App\Models\EventRegistrationQuestion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRegistrationQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled in the controller/middleware
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'question_text' => ['sometimes', 'required', 'string', 'max:500'],
            'question_type' => ['sometimes', 'required', 'string', Rule::in(EventRegistrationQuestion::QUESTION_TYPES)],
            'is_required' => ['sometimes', 'boolean'],
            'options_json' => ['nullable', 'array'],
            'options_json.*' => ['string', 'max:255'],
            'order_index' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Get the question being updated
            $question = $this->route('question');

            // Determine the effective question type
            $type = $this->input('question_type', $question?->question_type);
            $options = $this->has('options_json') ? $this->input('options_json') : ($question?->options_json ?? []);

            // Validate that select/multiselect types have options
            if (in_array($type, EventRegistrationQuestion::TYPES_REQUIRING_OPTIONS)) {
                if (empty($options) || !is_array($options) || count($options) < 1) {
                    $validator->errors()->add(
                        'options_json',
                        'Options are required for select and multiselect question types.'
                    );
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
            'question_text.required' => 'The question text is required.',
            'question_text.max' => 'The question text cannot exceed 500 characters.',
            'question_type.required' => 'The question type is required.',
            'question_type.in' => 'Invalid question type. Valid types are: ' . implode(', ', EventRegistrationQuestion::QUESTION_TYPES),
            'options_json.array' => 'Options must be provided as an array.',
            'options_json.*.string' => 'Each option must be a string.',
            'options_json.*.max' => 'Each option cannot exceed 255 characters.',
        ];
    }
}
