"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Loader2,
  FileText,
  ToggleLeft,
  ToggleRight,
  Trash2,
  GripVertical,
  X,
  AlertCircle,
  Type,
  AlignLeft,
  List,
  ListChecks,
  CheckSquare,
  ToggleLeftIcon,
  Hash,
  File,
  ChevronDown,
} from "lucide-react";
import {
  listRegistrationQuestions,
  createRegistrationQuestion,
  updateRegistrationQuestion,
  deleteRegistrationQuestion,
  reorderRegistrationQuestions,
  type RegistrationQuestion,
  type RegistrationQuestionCreate,
  type QuestionType,
} from "@/lib/api";

interface RegistrationQuestionsTabProps {
  eventId: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Short Text", icon: <Type size={16} /> },
  { value: "textarea", label: "Long Text", icon: <AlignLeft size={16} /> },
  { value: "select", label: "Dropdown", icon: <List size={16} /> },
  { value: "multiselect", label: "Multi-select", icon: <ListChecks size={16} /> },
  { value: "checkbox", label: "Checkbox", icon: <CheckSquare size={16} /> },
  { value: "yesno", label: "Yes/No", icon: <ToggleLeftIcon size={16} /> },
  { value: "number", label: "Number", icon: <Hash size={16} /> },
  { value: "file", label: "File Upload", icon: <File size={16} /> },
];

const getTypeIcon = (type: QuestionType) => {
  const found = QUESTION_TYPES.find((t) => t.value === type);
  return found?.icon || <FileText size={16} />;
};

const getTypeLabel = (type: QuestionType) => {
  const found = QUESTION_TYPES.find((t) => t.value === type);
  return found?.label || type;
};

interface SortableQuestionItemProps {
  question: RegistrationQuestion;
  onEdit: (question: RegistrationQuestion) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
  editingId: string | null;
}

function SortableQuestionItem({
  question,
  onEdit,
  onDelete,
  actionLoading,
  editingId,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-5 transition-colors ${
        isDragging
          ? "bg-white/[0.08] z-50 shadow-lg rounded-xl"
          : editingId === question.id
          ? "bg-white/[0.04]"
          : "hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 -ml-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={18} />
        </button>

        {/* Question icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            question.is_required
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-white/[0.04] border-white/[0.06]"
          }`}
        >
          <span className={question.is_required ? "text-amber-400" : "text-white/40"}>
            {getTypeIcon(question.question_type)}
          </span>
        </div>

        {/* Question details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {question.question_text}
            </span>
            {question.is_required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 flex-shrink-0">
                Required
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-white/40">
              {getTypeLabel(question.question_type)}
            </span>
            {question.options_json && question.options_json.length > 0 && (
              <span className="text-xs text-white/30">
                {question.options_json.length} options
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(question)}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(question.id)}
            disabled={actionLoading === question.id}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
            title="Delete"
          >
            {actionLoading === question.id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationQuestionsTab({
  eventId,
}: RegistrationQuestionsTabProps) {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RegistrationQuestionCreate>({
    question_text: "",
    question_type: "text",
    is_required: false,
    options_json: [],
  });
  const [optionInput, setOptionInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchQuestions = useCallback(async () => {
    try {
      setError(null);
      const data = await listRegistrationQuestions(eventId);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load registration questions");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "text",
      is_required: false,
      options_json: [],
    });
    setOptionInput("");
    setFormError(null);
    setShowCreate(false);
    setEditingId(null);
    setShowTypeDropdown(false);
  };

  const needsOptions = (type: QuestionType) => {
    return type === "select" || type === "multiselect";
  };

  const handleCreate = async () => {
    if (!formData.question_text.trim()) {
      setFormError("Question text is required");
      return;
    }
    if (needsOptions(formData.question_type) && (!formData.options_json || formData.options_json.length < 2)) {
      setFormError("Please add at least 2 options for this question type");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await createRegistrationQuestion(eventId, {
        ...formData,
        question_text: formData.question_text.trim(),
        order_index: questions.length,
      });
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || "Failed to create question");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.question_text.trim()) {
      setFormError("Question text is required");
      return;
    }
    if (needsOptions(formData.question_type) && (!formData.options_json || formData.options_json.length < 2)) {
      setFormError("Please add at least 2 options for this question type");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await updateRegistrationQuestion(id, {
        ...formData,
        question_text: formData.question_text.trim(),
      });
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || "Failed to update question");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteRegistrationQuestion(id);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to delete question");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (question: RegistrationQuestion) => {
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      options_json: question.options_json || [],
    });
    setEditingId(question.id);
    setShowCreate(false);
    setFormError(null);
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setFormData({
      ...formData,
      options_json: [...(formData.options_json || []), optionInput.trim()],
    });
    setOptionInput("");
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options_json: (formData.options_json || []).filter((_, i) => i !== index),
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);

      // Save new order to backend
      try {
        await reorderRegistrationQuestions(
          eventId,
          newQuestions.map((q) => q.id)
        );
      } catch (err: any) {
        // Revert on error
        setQuestions(questions);
        setError(err.message || "Failed to reorder questions");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/90">Registration Questions</h2>
          <p className="text-sm text-white/40 mt-1">
            Add custom questions to collect from attendees during registration
          </p>
        </div>
        {!showCreate && !editingId && (
          <button
            onClick={() => {
              setShowCreate(true);
              setFormData({
                question_text: "",
                question_type: "text",
                is_required: false,
                options_json: [],
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm font-medium text-white/80 transition-all"
          >
            <Plus size={16} />
            Add Question
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreate || editingId) && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-base font-medium text-white/90">
              {editingId ? "Edit Question" : "Add New Question"}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Question text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Question</label>
              <input
                type="text"
                value={formData.question_text}
                onChange={(e) =>
                  setFormData({ ...formData, question_text: e.target.value })
                }
                placeholder="e.g., What is your t-shirt size?"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Question type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">
                      {getTypeIcon(formData.question_type)}
                    </span>
                    <span>{getTypeLabel(formData.question_type)}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-white/40 transition-transform ${
                      showTypeDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-2 py-2 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl">
                    {QUESTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, question_type: type.value });
                          setShowTypeDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          formData.question_type === type.value
                            ? "bg-white/[0.08] text-white"
                            : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span className="text-white/50">{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Options for select/multiselect */}
            {needsOptions(formData.question_type) && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/60">Options</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Add an option"
                    className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-white/70 transition-all"
                  >
                    Add
                  </button>
                </div>
                {formData.options_json && formData.options_json.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.options_json.map((option, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white/80"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-white/40 hover:text-white/70"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-white/40">
                  Press Enter or click Add to add each option
                </p>
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div>
                <p className="text-sm font-medium text-white/80">Required</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Attendees must answer this question
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, is_required: !formData.is_required })
                }
                className="relative"
              >
                {formData.is_required ? (
                  <ToggleRight size={36} className="text-amber-400" />
                ) : (
                  <ToggleLeft size={36} className="text-white/30" />
                )}
              </button>
            </div>

            {/* Form error */}
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-sm text-red-400">{formError}</p>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {editingId ? "Saving..." : "Creating..."}
                  </>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Add Question"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions list with drag and drop */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 size={24} className="text-white/40 animate-spin" />
            <p className="text-sm text-white/40">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <FileText size={24} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white/60 font-medium">No custom questions yet</p>
              <p className="text-sm text-white/30 mt-1">
                Add questions to collect additional info from attendees
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-white/[0.04]">
                {questions.map((question) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    actionLoading={actionLoading}
                    editingId={editingId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Tips section */}
      {questions.length > 0 && (
        <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="text-white/60 font-medium">Tip:</span> Drag questions to
            reorder them. Required questions are highlighted and must be answered by
            attendees during registration.
          </p>
        </div>
      )}
    </div>
  );
}
