const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:4000/api/tasks';

async function requestJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('Could not reach the task server on port 4000.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.error) || `Request failed (${response.status})`);
  }

  return data;
}

export function fetchTasks() {
  return requestJson(API_BASE_URL);
}

export function createTask(payload) {
  return requestJson(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateTask(id, payload) {
  return requestJson(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function toggleTask(id) {
  return requestJson(`${API_BASE_URL}/${id}/toggle`, {
    method: 'PATCH'
  });
}

export function deleteTask(id) {
  return requestJson(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  });
}
