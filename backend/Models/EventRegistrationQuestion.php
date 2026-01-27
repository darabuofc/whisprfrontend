<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventRegistrationQuestion extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     */
    protected $table = 'event_registration_questions';

    /**
     * The primary key type.
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'event_id',
        'question_text',
        'question_type',
        'is_required',
        'options_json',
        'order_index',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_required' => 'boolean',
        'options_json' => 'array',
        'order_index' => 'integer',
    ];

    /**
     * Valid question types.
     */
    public const QUESTION_TYPES = [
        'text',
        'textarea',
        'select',
        'multiselect',
        'checkbox',
        'yesno',
        'number',
        'file',
    ];

    /**
     * Question types that require options.
     */
    public const TYPES_REQUIRING_OPTIONS = [
        'select',
        'multiselect',
    ];

    /**
     * Get the event that owns this question.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the answers for this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(EventRegistrationAnswer::class, 'question_id');
    }

    /**
     * Check if this question type requires options.
     */
    public function requiresOptions(): bool
    {
        return in_array($this->question_type, self::TYPES_REQUIRING_OPTIONS);
    }

    /**
     * Scope to order by order_index.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index', 'asc');
    }
}
