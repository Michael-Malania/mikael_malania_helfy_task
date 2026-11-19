const express = require('express');
const taskStore = require('../data/taskStore');
const {
  parseTaskId,
  validateCreateTask,
  validateUpdateTask
} = require('../middleware/validateTask');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(taskStore.getAllTasks());
});

router.post('/', validateCreateTask, (req, res) => {
  const created = taskStore.createTask(req.validatedTask);
  res.status(201).json(created);
});

router.put('/:id', parseTaskId, validateUpdateTask, (req, res) => {
  const updated = taskStore.updateTask(req.taskId, req.validatedTask);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.status(200).json(updated);
});

router.patch('/:id/toggle', parseTaskId, (req, res) => {
  const updated = taskStore.toggleTask(req.taskId);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.status(200).json(updated);
});

router.delete('/:id', parseTaskId, (req, res) => {
  const removed = taskStore.deleteTask(req.taskId);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.status(200).json({ message: 'Task deleted', id: removed.id });
});

module.exports = router;
