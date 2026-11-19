import { useEffect, useState } from 'react';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskForm({
  initialTask = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const isEditMode = Boolean(initialTask);
  const [title, setTitle] = useState(initialTask ? initialTask.title : '');
  const [description, setDescription] = useState(
    initialTask ? initialTask.description : ''
  );
  const [priority, setPriority] = useState(
    initialTask ? initialTask.priority : 'medium'
  );
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setTitle(initialTask ? initialTask.title : '');
    setDescription(initialTask ? initialTask.description : '');
    setPriority(initialTask ? initialTask.priority : 'medium');
    setValidationError('');
    setSubmitError('');
  }, [initialTask]);

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError('');
    setSubmitError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Please enter a task title.');
      return;
    }
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setValidationError(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
      return;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setValidationError(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
      );
      return;
    }
    if (!PRIORITIES.includes(priority)) {
      setValidationError('Please select a valid priority.');
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        description,
        priority
      });

      if (!isEditMode) {
        setTitle('');
        setDescription('');
        setPriority('medium');
      }
    } catch (err) {
      setSubmitError(err.message || 'Could not save task.');
    }
  }

  const fieldIdPrefix = isEditMode ? 'edit-task' : 'create-task';

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor={`${fieldIdPrefix}-title`}>Title</label>
        <input
          id={`${fieldIdPrefix}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${fieldIdPrefix}-description`}>Description</label>
        <textarea
          id={`${fieldIdPrefix}-description`}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add optional notes"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${fieldIdPrefix}-priority`}>Priority</label>
        <select
          id={`${fieldIdPrefix}-priority`}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {(validationError || submitError) && (
        <p className="form-error" role="alert">
          {validationError || submitError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Task'}
        </button>
        {isEditMode && onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
