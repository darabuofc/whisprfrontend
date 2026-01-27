<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderRegistrationQuestionsRequest extends FormRequest
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
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.id' => ['required', 'string', 'exists:event_registration_questions,id'],
            'questions.*.order_index' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'questions.required' => 'Questions array is required.',
            'questions.array' => 'Questions must be an array.',
            'questions.min' => 'At least one question must be provided.',
            'questions.*.id.required' => 'Each question must have an ID.',
            'questions.*.id.exists' => 'One or more question IDs are invalid.',
            'questions.*.order_index.required' => 'Each question must have an order index.',
            'questions.*.order_index.integer' => 'Order index must be an integer.',
            'questions.*.order_index.min' => 'Order index cannot be negative.',
        ];
    }
}
