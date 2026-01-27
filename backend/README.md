# Event Registration Questions - Backend Implementation

This directory contains the Laravel backend code for implementing custom registration questions for events.

## Overview

This implementation allows organizers to:
- Create custom registration questions for their events
- Edit and delete questions
- Reorder questions via drag & drop
- Mark questions as required
- Support multiple question types

Attendees can:
- View registration questions when registering for an event
- Submit answers that are stored with their registration

## File Structure

```
backend/
├── Models/
│   ├── EventRegistrationQuestion.php     # Question model
│   ├── EventRegistrationAnswer.php       # Answer model
│   ├── Event.php.snippet                 # Add to existing Event model
│   └── Registration.php.snippet          # Add to existing Registration model
│
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── Organizer/
│   │       │   └── RegistrationQuestionController.php  # Organizer endpoints
│   │       ├── EventRegistrationQuestionController.php # Attendee endpoint
│   │       └── RegistrationController.php.snippet      # Modify existing
│   │
│   └── Requests/
│       ├── StoreRegistrationQuestionRequest.php
│       ├── UpdateRegistrationQuestionRequest.php
│       ├── ReorderRegistrationQuestionsRequest.php
│       └── StoreRegistrationWithAnswersRequest.php
│
├── Services/
│   ├── RegistrationQuestionService.php   # Question business logic
│   ├── RegistrationAnswerService.php     # Answer business logic
│   └── RegistrationService.php           # Registration with answers
│
├── database/
│   └── migrations/
│       ├── 2024_01_01_000001_create_event_registration_questions_table.php
│       └── 2024_01_01_000002_create_event_registration_answers_table.php
│
└── routes/
    └── api.php.snippet                   # Add to existing routes
```

## Installation

### 1. Copy Files

Copy the files to your Laravel application:

```bash
# Models
cp Models/EventRegistrationQuestion.php your-laravel-app/app/Models/
cp Models/EventRegistrationAnswer.php your-laravel-app/app/Models/

# Controllers
mkdir -p your-laravel-app/app/Http/Controllers/Api/Organizer
cp Http/Controllers/Api/Organizer/RegistrationQuestionController.php your-laravel-app/app/Http/Controllers/Api/Organizer/
cp Http/Controllers/Api/EventRegistrationQuestionController.php your-laravel-app/app/Http/Controllers/Api/

# Requests
cp Http/Requests/*.php your-laravel-app/app/Http/Requests/

# Services
cp Services/*.php your-laravel-app/app/Services/
```

### 2. Update Existing Models

Add the relationship to your **Event** model (`app/Models/Event.php`):

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

// Add this method:
public function registrationQuestions(): HasMany
{
    return $this->hasMany(EventRegistrationQuestion::class)->ordered();
}
```

Add the relationship to your **Registration** model (`app/Models/Registration.php`):

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

// Add this method:
public function answers(): HasMany
{
    return $this->hasMany(EventRegistrationAnswer::class, 'registration_id');
}
```

### 3. Add Routes

Add the routes from `routes/api.php.snippet` to your `routes/api.php` file.

### 4. Run Migrations (if tables don't exist)

If the tables don't already exist:

```bash
php artisan migrate
```

## API Endpoints

### Organizer Endpoints (requires auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizer/events/{eventId}/registration-questions` | List all questions for an event |
| POST | `/api/organizer/events/{eventId}/registration-questions` | Create a new question |
| POST | `/api/organizer/events/{eventId}/registration-questions/reorder` | Reorder questions |
| PUT | `/api/organizer/registration-questions/{id}` | Update a question |
| DELETE | `/api/organizer/registration-questions/{id}` | Delete a question |

### Attendee/Public Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/{eventId}/registration-questions` | Get questions for registration form |

### Registration Endpoint (modified)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/{eventId}/registrations` | Create registration with answers |

## Request/Response Examples

### Create Question

**POST** `/api/organizer/events/{eventId}/registration-questions`

```json
{
  "question_text": "What is your dietary preference?",
  "question_type": "select",
  "is_required": true,
  "options_json": ["Vegetarian", "Vegan", "Non-vegetarian", "Other"]
}
```

**Response:**

```json
{
  "message": "Registration question created successfully.",
  "question": {
    "id": "uuid-here",
    "event_id": "event-uuid",
    "question_text": "What is your dietary preference?",
    "question_type": "select",
    "is_required": true,
    "options": ["Vegetarian", "Vegan", "Non-vegetarian", "Other"],
    "order_index": 0,
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Reorder Questions

**POST** `/api/organizer/events/{eventId}/registration-questions/reorder`

```json
{
  "questions": [
    { "id": "question-uuid-1", "order_index": 0 },
    { "id": "question-uuid-2", "order_index": 1 },
    { "id": "question-uuid-3", "order_index": 2 }
  ]
}
```

### Get Questions (Attendee)

**GET** `/api/events/{eventId}/registration-questions`

**Response:**

```json
{
  "message": "Registration questions retrieved successfully.",
  "questions": [
    {
      "id": "uuid-1",
      "question_text": "What is your dietary preference?",
      "question_type": "select",
      "is_required": true,
      "options": ["Vegetarian", "Vegan", "Non-vegetarian", "Other"],
      "order_index": 0
    },
    {
      "id": "uuid-2",
      "question_text": "Do you have any allergies?",
      "question_type": "textarea",
      "is_required": false,
      "options": null,
      "order_index": 1
    }
  ]
}
```

### Submit Registration with Answers

**POST** `/api/events/{eventId}/registrations`

```json
{
  "pass_type_id": "pass-uuid",
  "discount_code": "SAVE10",
  "answers": [
    { "question_id": "uuid-1", "answer": "Vegetarian" },
    { "question_id": "uuid-2", "answer": "Peanut allergy" }
  ]
}
```

## Question Types

| Type | Description | Options Required |
|------|-------------|------------------|
| `text` | Single-line text input | No |
| `textarea` | Multi-line text input | No |
| `select` | Single selection dropdown | Yes |
| `multiselect` | Multiple selection | Yes |
| `checkbox` | Single checkbox (yes/no) | No |
| `yesno` | Yes/No radio buttons | No |
| `number` | Numeric input | No |
| `file` | File upload | No |

## Validation

The implementation includes comprehensive validation:

- Required questions must be answered
- Select/multiselect answers must be valid options
- Number fields must contain numeric values
- Question types must be from the allowed list
- Options are required for select/multiselect types

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

## Database Schema

### event_registration_questions

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| event_id | string (FK) | Reference to events table |
| question_text | string(500) | The question text |
| question_type | enum | Type of question |
| is_required | boolean | Whether answer is required |
| options_json | json | Options for select/multiselect |
| order_index | integer | Display order |
| created_at | timestamp | Creation timestamp |

### event_registration_answers

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Primary key |
| registration_id | string (FK) | Reference to registrations |
| question_id | uuid (FK) | Reference to questions |
| answer_text | text | The answer value |
| created_at | timestamp | Creation timestamp |
