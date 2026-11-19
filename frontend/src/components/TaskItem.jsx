function formatCreatedAt(value) {
  if (!value) {
    return 'Unknown date';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggle,
  isMutating = false,
  isInactive = false
}) {
  const priorityLabel = task.priority
    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    : 'Medium';

  const cardClasses = [
    'task-card',
    `task-card--priority-${task.priority || 'medium'}`,
    task.completed ? 'task-card--completed' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const buttonTabIndex = isInactive ? -1 : undefined;

  return (
    <article className={cardClasses} aria-hidden={isInactive || undefined}>
      <div className="task-card-header">
        <span className={`priority-badge priority-badge--${task.priority || 'medium'}`}>
          {priorityLabel}
        </span>
        <span
          className={`status-badge ${
            task.completed ? 'status-badge--done' : 'status-badge--pending'
          }`}
        >
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      <p className="task-card-description">
        {task.description ? task.description : 'No description provided.'}
      </p>

      <p className="task-card-meta">Created {formatCreatedAt(task.createdAt)}</p>

      <div className="task-card-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onToggle && onToggle(task.id)}
          disabled={isMutating || isInactive || !onToggle}
          tabIndex={buttonTabIndex}
        >
          {isMutating
            ? 'Updating...'
            : task.completed
              ? 'Mark Pending'
              : 'Mark Completed'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onEdit && onEdit(task)}
          disabled={isMutating || isInactive || !onEdit}
          tabIndex={buttonTabIndex}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete && onDelete(task)}
          disabled={isMutating || isInactive || !onDelete}
          tabIndex={buttonTabIndex}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
