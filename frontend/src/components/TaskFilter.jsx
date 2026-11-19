const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' }
];

export default function TaskFilter({ activeFilter, counts, onFilterChange }) {
  return (
    <div className="task-filter" role="group" aria-label="Filter tasks by status">
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.key;
        const count = counts[option.key] ?? 0;
        return (
          <button
            key={option.key}
            type="button"
            className={`filter-btn ${isActive ? 'filter-btn--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onFilterChange(option.key)}
          >
            {option.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
