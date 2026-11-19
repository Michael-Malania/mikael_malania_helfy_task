import { useEffect, useState } from 'react';
import { createTask, fetchTasks, toggleTask } from '../services/taskApi';
import TaskFilter from '../components/TaskFilter';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [mutatingId, setMutatingId] = useState(null);

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchTasks();
        if (active) {
          setTasks(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load tasks.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      active = false;
    };
  }, []);

  async function handleCreateTask(payload) {
    setIsCreating(true);
    setError('');
    try {
      const created = await createTask(payload);
      setTasks((prev) => [...prev, created]);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleTask(id) {
    if (mutatingId !== null) {
      return;
    }
    setMutatingId(id);
    setError('');
    try {
      const updated = await toggleTask(id);
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch (err) {
      setError(err.message || 'Failed to update task status.');
    } finally {
      setMutatingId(null);
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const counts = {
    all: tasks.length,
    completed: completedCount,
    pending: tasks.length - completedCount
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') {
      return task.completed;
    }
    if (filter === 'pending') {
      return !task.completed;
    }
    return true;
  });

  const emptyMessage =
    tasks.length === 0
      ? 'No tasks yet. Create your first task above.'
      : `No ${filter} tasks found.`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p className="app-subtitle">Create, update, and browse tasks in the carousel.</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <div className="error-banner-actions">
              <button type="button" className="btn btn-secondary" onClick={loadTasks}>
                Retry
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setError('')}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <section className="panel create-panel" aria-label="Create task">
          <h2>Add Task</h2>
          <TaskForm onSubmit={handleCreateTask} isSubmitting={isCreating} />
        </section>

        <section className="panel tasks-panel" aria-label="Task list">
          <div className="tasks-panel-header">
            <h2>Tasks</h2>
            <TaskFilter
              activeFilter={filter}
              counts={counts}
              onFilterChange={setFilter}
            />
          </div>

          {loading ? (
            <p className="status-message">Loading tasks...</p>
          ) : (
            <TaskList
              tasks={filteredTasks}
              emptyMessage={emptyMessage}
              onToggle={handleToggleTask}
              mutatingId={mutatingId}
            />
          )}
        </section>
      </main>
    </div>
  );
}
