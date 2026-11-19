const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
const { resetStore } = require('../data/taskStore');

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json();
  return { status: response.status, data };
}

describe('Tasks REST API', () => {
  before((_, done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  beforeEach(() => {
    resetStore(false);
  });

  it('starts empty by default and returns 200 on GET /api/tasks', async () => {
    const res = await request('/api/tasks');
    assert.equal(res.status, 200);
    assert.deepEqual(res.data, []);
  });

  it('populates four sample tasks when seeded', async () => {
    resetStore(true);
    const res = await request('/api/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.data.length, 4);
    const priorities = new Set(res.data.map((task) => task.priority));
    assert.deepEqual(priorities, new Set(['low', 'medium', 'high']));
  });

  it('creates a task with defaults and validates bad payloads', async () => {
    const created = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  Write tests  ' })
    });

    assert.equal(created.status, 201);
    assert.equal(created.data.id, 1);
    assert.equal(created.data.title, 'Write tests');
    assert.equal(created.data.description, '');
    assert.equal(created.data.priority, 'medium');
    assert.equal(created.data.completed, false);
    assert.ok(!Number.isNaN(Date.parse(created.data.createdAt)));

    const badTitle = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' })
    });
    assert.equal(badTitle.status, 400);
    assert.ok(badTitle.data.error);

    const longTitle = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'a'.repeat(121) })
    });
    assert.equal(longTitle.status, 400);

    const badPriority = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Valid', priority: 'urgent' })
    });
    assert.equal(badPriority.status, 400);

    const arrayBody = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([])
    });
    assert.equal(arrayBody.status, 400);
  });

  it('updates a task via PUT while preserving id and createdAt', async () => {
    const { data: created } = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Initial',
        description: 'Old notes',
        priority: 'low',
        completed: true
      })
    });

    const updated = await request(`/api/tasks/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 999,
        createdAt: '2000-01-01T00:00:00.000Z',
        title: 'Edited',
        description: 'New notes',
        priority: 'high'
      })
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.data.id, created.id);
    assert.equal(updated.data.createdAt, created.createdAt);
    assert.equal(updated.data.title, 'Edited');
    assert.equal(updated.data.description, 'New notes');
    assert.equal(updated.data.priority, 'high');
    assert.equal(updated.data.completed, true);

    const missingPriority = await request(`/api/tasks/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Only title' })
    });
    assert.equal(missingPriority.status, 400);

    const notFound = await request('/api/tasks/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Missing', priority: 'low' })
    });
    assert.equal(notFound.status, 404);
  });

  it('toggles task completion and deletes tasks with proper status codes', async () => {
    const { data: created } = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Toggle me', priority: 'medium' })
    });

    const toggledTrue = await request(`/api/tasks/${created.id}/toggle`, {
      method: 'PATCH'
    });
    assert.equal(toggledTrue.status, 200);
    assert.equal(toggledTrue.data.completed, true);

    const toggledFalse = await request(`/api/tasks/${created.id}/toggle`, {
      method: 'PATCH'
    });
    assert.equal(toggledFalse.status, 200);
    assert.equal(toggledFalse.data.completed, false);

    const badId = await request('/api/tasks/abc/toggle', { method: 'PATCH' });
    assert.equal(badId.status, 400);

    const removed = await request(`/api/tasks/${created.id}`, {
      method: 'DELETE'
    });
    assert.equal(removed.status, 200);
    assert.equal(removed.data.id, created.id);

    const missingAfterDelete = await request(`/api/tasks/${created.id}`, {
      method: 'DELETE'
    });
    assert.equal(missingAfterDelete.status, 404);
  });

  it('returns 400 for malformed JSON and 404 for unknown routes', async () => {
    const badJson = await request('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid'
    });
    assert.equal(badJson.status, 400);
    assert.equal(badJson.data.error, 'Invalid JSON payload');

    const unknown = await request('/api/unknown');
    assert.equal(unknown.status, 404);
  });
});
