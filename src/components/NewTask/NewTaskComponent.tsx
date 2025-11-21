"use client";

import React, { useState, FormEvent } from "react";

// Types
interface TaskFormData {
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  board: string;
  tagsInput: string;
  description: string;
}

interface TaskPayload {
  user_id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  board: string;
  tags: string[];
  description?: string;
}

// Constants
const STATUS_OPTIONS = ["To-Do", "In Progress", "Done", "Pending"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Now"];
const BOARD_OPTIONS = ["Design Projects", "Senior Design", "PennOS", "House", "Personal"];

// Component
export default function NewTaskComponent() {
  const initialFormData: TaskFormData = {
    title: "",
    status: "To-Do",
    priority: "Low",
    dueDate: "",
    board: "Design Projects",
    tagsInput: "",
    description: "",
  };

  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error on change
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Task title is required";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: TaskPayload = {
      user_id: "test_user",
      title: formData.title.trim(),
      status: formData.status,
      priority: formData.priority,
      board: formData.board,
      tags: formData.tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean),
      ...(formData.dueDate && { due_date: formData.dueDate }),
      ...(formData.description.trim() && { description: formData.description.trim() }),
    };

    try {
      // Save to localStorage for demo
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      existingTasks.push(payload);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));

      alert('Task created successfully!');
      setFormData(initialFormData); // Reset form
    } catch (err) {
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setError(null);
  };

  return (
    <aside className="bg-beige border border-green-3 rounded-2xl shadow-sm px-6 py-6 flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-section-sub-header text-dark-green-1 mb-2">
        + Create New Task
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-body text-dark-green-1">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Field label="TASK TITLE *">
          <input
            type="text"
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-2"
            placeholder="Enter task title..."
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={isSubmitting}
            required
          />
        </Field>

        <Field label="STATUS">
          <select
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-2"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            disabled={isSubmitting}
          >
            {STATUS_OPTIONS.map((_option) => (
              <option key={_option} value={_option}>
                {_option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="PRIORITY">
          <select
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-2"
            value={formData.priority}
            onChange={(e) => handleInputChange("priority", e.target.value)}
            disabled={isSubmitting}
          >
            {PRIORITY_OPTIONS.map((_option) => (
              <option key={_option} value={_option}>
                {_option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="DUE DATE">
          <input
            type="date"
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 text-body text-dark-green-1 outline-none focus:ring-2 focus:ring-green-2"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="BOARD">
          <select
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-2"
            value={formData.board}
            onChange={(e) => handleInputChange("board", e.target.value)}
            disabled={isSubmitting}
          >
            {BOARD_OPTIONS.map((_option) => (
              <option key={_option} value={_option}>
                {_option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="TAGS (COMMA SEPARATED)">
          <input
            type="text"
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-2"
            placeholder="e.g. design, bug, urgent"
            value={formData.tagsInput}
            onChange={(e) => handleInputChange("tagsInput", e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="DESCRIPTION">
          <textarea
            rows={3}
            className="w-full rounded-lg border border-green-4 bg-off-white px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-green-2"
            placeholder="Add task description..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className={`flex-1 rounded-full px-4 py-2 text-button transition ${
              isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-2 text-off-white hover:bg-green-1"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-full border border-green-3 bg-off-white text-button text-dark-green-1 py-2 hover:bg-beige transition"
            disabled={isSubmitting}
          >
            Clear
          </button>
        </div>
      </form>
    </aside>
  );
}

// Helper Component
type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-small-header text-dark-green-2 tracking-[0.08em] uppercase text-xs">
        {label}
      </span>
      {children}
    </label>
  );
}
