const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateSharedFields(body, { requirePriority }) {
  if (!isPlainObject(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  if (typeof body.title !== 'string') {
    return { error: 'Title is required and must be a string' };
  }

  const trimmedTitle = body.title.trim();
  if (!trimmedTitle) {
    return { error: 'Title cannot be empty' };
  }
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return { error: `Title cannot exceed ${MAX_TITLE_LENGTH} characters` };
  }

  let description = '';
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      return { error: 'Description must be a string' };
    }
    if (body.description.length > MAX_DESCRIPTION_LENGTH) {
      return { error: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters` };
    }
    description = body.description;
  }

  let priority = body.priority;
  if (priority === undefined) {
    if (requirePriority) {
      return { error: 'Priority is required (low, medium, or high)' };
    }
    priority = 'medium';
  } else if (!ALLOWED_PRIORITIES.includes(priority)) {
    return { error: 'Priority must be low, medium, or high' };
  }

  let completed = body.completed;
  if (completed !== undefined && typeof completed !== 'boolean') {
    return { error: 'Completed must be a boolean' };
  }

  return {
    value: {
      title: trimmedTitle,
      description,
      priority,
      completed
    }
  };
}

function parseTaskId(req, res, next) {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: 'Task id must be a positive integer' });
  }

  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Task id must be a positive integer' });
  }

  req.taskId = id;
  return next();
}

function validateCreateTask(req, res, next) {
  const result = validateSharedFields(req.body, { requirePriority: false });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  req.validatedTask = {
    ...result.value,
    completed: result.value.completed !== undefined ? result.value.completed : false
  };
  return next();
}

function validateUpdateTask(req, res, next) {
  const result = validateSharedFields(req.body, { requirePriority: true });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  req.validatedTask = result.value;
  return next();
}

module.exports = {
  parseTaskId,
  validateCreateTask,
  validateUpdateTask
};
