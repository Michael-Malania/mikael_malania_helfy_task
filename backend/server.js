const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const { seedInitialTasks } = require('./data/taskStore');

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  return next(err);
});

app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app without binding a port on import so API tests can bind port 0 directly.
if (require.main === module) {
  const shouldSeed = process.argv.includes('--seed') || process.env.SEED_TASKS === 'true';
  if (shouldSeed) {
    seedInitialTasks();
  }

  app.listen(PORT, () => {
    console.log(`Task Manager API listening on port ${PORT}`);
  });
}

module.exports = app;
