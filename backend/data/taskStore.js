let tasks = [];
let nextId = 1;

const SAMPLE_TASKS = [
  {
    title: 'Review pull requests',
    description: 'Check open frontend carousel changes and leave feedback.',
    priority: 'high',
    completed: false
  },
  {
    title: 'Prepare sprint notes',
    description: 'Summarize completed tickets and blockers for tomorrow.',
    priority: 'medium',
    completed: true
  },
  {
    title: 'Clean up workspace',
    description: 'Remove unused branches and update local dependencies.',
    priority: 'low',
    completed: false
  },
  {
    title: 'Verify mobile spacing',
    description: 'Test card padding and button alignment on a 375px screen.',
    priority: 'medium',
    completed: false
  }
];

function cloneTask(task) {
  return { ...task };
}

function getAllTasks() {
  return tasks.map(cloneTask);
}

function getTaskById(id) {
  const found = tasks.find((task) => task.id === id);
  return found ? cloneTask(found) : null;
}

function createTask({ title, description = '', priority = 'medium', completed = false }) {
  // Keep IDs strictly increasing even after deletions so callers never see reused IDs.
  const newTask = {
    id: nextId++,
    title,
    description,
    completed: Boolean(completed),
    createdAt: new Date().toISOString(),
    priority
  };
  tasks.push(newTask);
  return cloneTask(newTask);
}

function updateTask(id, { title, description, priority, completed }) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return null;
  }

  const existing = tasks[index];
  const updated = {
    ...existing,
    title,
    description: description !== undefined ? description : '',
    priority,
    completed: completed !== undefined ? Boolean(completed) : existing.completed
  };

  tasks[index] = updated;
  return cloneTask(updated);
}

function toggleTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return null;
  }

  const updated = {
    ...tasks[index],
    completed: !tasks[index].completed
  };

  tasks[index] = updated;
  return cloneTask(updated);
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return null;
  }

  const [removed] = tasks.splice(index, 1);
  return cloneTask(removed);
}

function seedInitialTasks() {
  if (tasks.length > 0) {
    return getAllTasks();
  }
  SAMPLE_TASKS.forEach((item) => {
    createTask(item);
  });
  return getAllTasks();
}

function resetStore(shouldSeed = false) {
  tasks = [];
  nextId = 1;
  if (shouldSeed) {
    seedInitialTasks();
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  seedInitialTasks,
  resetStore
};
