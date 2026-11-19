import { useEffect, useRef, useState } from 'react';
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTask,
  updateTask
} from '../services/taskApi';
import Modal from '../components/Modal';
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
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const isMountedRef = useRef(true);

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks();
      if (isMountedRef.current) {
        setTasks(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load tasks.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    loadTasks();
    return () => {
      isMountedRef.current = false;
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

  async function handleUpdateTask(payload) {
    if (!editingTask) {
      return;
    }
    setIsModalSubmitting(true);
    setMutatingId(editingTask.id);
    setError('');
    try {
      const updated = await updateTask(editingTask.id, {
        ...payload,
        completed: editingTask.completed
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? updated : task))
      );
      setEditingTask(null);
    } finally {
      setIsModalSubmitting(false);
      setMutatingId(null);
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

  async function handleConfirmDelete() {
    if (!deletingTask) {
      return;
    }
    setIsModalSubmitting(true);
    setMutatingId(deletingTask.id);
    setDeleteError('');
    try {
      await deleteTask(deletingTask.id);
      setTasks((prev) => prev.filter((task) => task.id !== deletingTask.id));
      setDeletingTask(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete task.');
    } finally {
      setIsModalSubmitting(false);
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
              onEdit={(task) => setEditingTask(task)}
              onDelete={(task) => {
                setDeleteError('');
                setDeletingTask(task);
              }}
              onToggle={handleToggleTask}
              mutatingId={mutatingId}
            />
          )}
        </section>
      </main>

      <Modal
        isOpen={Boolean(editingTask)}
        title="Edit Task"
        onClose={() => setEditingTask(null)}
        disableClose={isModalSubmitting}
      >
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          isSubmitting={isModalSubmitting}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        onClose={() => setDeletingTask(null)}
        disableClose={isModalSubmitting}
      >
        <p className="confirm-text">
          Are you sure you want to delete{' '}
          <strong>{deletingTask ? deletingTask.title : ''}</strong>?
        </p>
        {deleteError && (
          <p className="form-error" role="alert">
            {deleteError}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeletingTask(null)}
            disabled={isModalSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={isModalSubmitting}
          >
            {isModalSubmitting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
