# Task Manager App

Full-stack Task Manager built with React, Express.js, and an in-memory task store, featuring a custom vanilla JS/React endless carousel and plain CSS styling.

## Backend Setup

1. `cd backend`
2. `npm install`
3. `npm start` (starts on port `4000` with an empty task list)

Optional seeded startup (loads 4 sample tasks on boot):

```sh
npm run start:seed
```

Run backend API tests:

```sh
npm test
```

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm start` (starts on port `3000`)

Production build check:

```sh
npm run build
```

## API Endpoints

Base URL: `http://localhost:4000/api/tasks`

Task model:

```json
{
  "id": 1,
  "title": "Review pull requests",
  "description": "Check open frontend carousel changes.",
  "completed": false,
  "createdAt": "2026-11-19T10:30:00.000Z",
  "priority": "high"
}
```

* `GET /api/tasks` - Returns all tasks (`200 OK`).
* `POST /api/tasks` - Validates `{ title, description?, priority?, completed? }` and creates a task (`201 Created`, `400 Bad Request` on validation failure or malformed JSON).
* `PUT /api/tasks/:id` - Validates `{ title, description?, priority, completed? }` and updates the task while preserving `id` and `createdAt` (`200 OK`, `400 Bad Request`, `404 Not Found`).
* `PATCH /api/tasks/:id/toggle` - Toggles `completed` (`200 OK`, `400 Bad Request`, `404 Not Found`).
* `DELETE /api/tasks/:id` - Deletes the task by ID (`200 OK`, `400 Bad Request`, `404 Not Found`).

## Assumptions and Design Decisions

* **`main-app-layout` vs. template tree**: The assignment text explicitly requires placing the main `App` component in a `main-app-layout` folder inside `frontend`, while the example file tree showed `frontend/src/App.js`. Following the explicit text rule, `App.jsx` lives at `frontend/src/main-app-layout/App.jsx` and `frontend/src/main.jsx` imports it directly.
* **Vite on port `3000` instead of Create React App**: Running on Node `v24.2.0`, Vite avoids deprecated `react-scripts` dependency conflicts while binding `npm start` to port `3000` (`--strictPort`). Because Vite serves `index.html` from the `frontend/` root rather than `frontend/public/`, `frontend/index.html` replaces `public/index.html`.
* **Manual-only 3-slot endless carousel**: `TaskList` renders at most three slots (`slot-prev`, `slot-current`, `slot-next`) using modular indexing (`O(1)` DOM nodes for large task lists) and smooth CSS `translateX` transitions. Navigation is manual-only (Previous/Next buttons, Left/Right arrow keys, and touch swipe) rather than auto-scrolling so Edit, Delete, and Toggle buttons remain stable to click. When `N === 0` an empty state renders; when `N === 1` navigation is disabled; for `N >= 2` the track wraps in both directions without visible jumps and preserves the active task by ID across filtering and deletion.
* **Shared modal for edit and delete**: Reuses one `Modal` component (`Escape` and backdrop dismissal) for both `TaskForm` editing and Delete confirmation to avoid shifting carousel card geometry or using native `window.confirm`.
* **Empty default store with `--seed`**: `npm start` starts with `[]` so empty-state behavior and clean API tests work predictably, while `npm run start:seed` loads sample tasks for fast visual inspection.

## Future Improvements

Left out of scope due to the 4-hour time limit:

* Task text search and multi-field sorting (date, priority, title)
* Task due dates and drag-and-drop card reordering
* Dark/light theme toggle and frontend `localStorage` persistence
* Full modal keyboard focus trapping beyond `Escape` / `aria-modal` and automated frontend UI tests
* Persistent backend database storage

## Time Spent

* Planning, architecture, and design doc: ~95 minutes
* Backend API, validation, and Node test suite: ~45 minutes
* Frontend layout, forms, modals, and 3-slot endless carousel: ~75 minutes
* Plain CSS styling, documentation, and verification: ~25 minutes
