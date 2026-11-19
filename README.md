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

* **`main-app-layout` vs. template folder tree**: The submission instructions ask to place the main `App` component in a `main-app-layout` folder inside `frontend`, while the example file tree showed `frontend/src/App.js`. I followed the written requirement and placed `App.jsx` at `frontend/src/main-app-layout/App.jsx`, importing it directly from `frontend/src/main.jsx`.
* **Vite instead of Create React App**: Because I am running Node `v24.2.0`, `react-scripts` tends to run into peer-dependency and legacy tooling issues. I used Vite with `npm start` bound to port `3000` (`--strictPort`) so startup still matches the instructions, and placed `index.html` at the `frontend/` root (Vite convention) instead of `frontend/public/`.
* **Manual-only 3-slot endless carousel**: Instead of rendering the entire list or using an auto-scrolling marquee (which makes clicking Edit/Delete/Toggle buttons frustrating), `TaskList` renders only three slots (`prev`, `current`, `next`) using modular wrap-around indexing and CSS `translateX` transitions. Users navigate with Previous/Next buttons, Left/Right arrow keys, or horizontal touch swipe. An empty list shows a fallback message, a single task disables navigation, and lists with `2` or more tasks loop in both directions while keeping the active task selected by ID if filters or deletions change the list.
* **Shared modal for edit and delete**: Edit (`TaskForm`) and Delete confirmation share one `Modal` component (`Escape` and backdrop close) so editing never stretches carousel card dimensions and deletion does not rely on `window.confirm`.
* **Empty startup by default**: `npm start` starts with an empty array (`[]`) to keep API tests predictable and let you see the empty state right away. Run `npm run start:seed` in `backend/` if you want 4 sample tasks loaded on startup.

## Future Improvements

Things I did not finish or intentionally left out to stay within the 4-hour limit:

* Search bar and sorting (by date, priority, or title)
* Task due dates and drag-and-drop reordering
* Dark/light theme toggle and `localStorage` persistence
* Modal Tab focus-trapping and automated frontend UI tests
* Database persistence on the backend

## Time Spent

* Planning and project setup: ~90 minutes
* Backend API, validation, and Node tests: ~50 minutes
* Frontend layout, modals, and 3-slot carousel: ~75 minutes
* Plain CSS styling, README, and manual bug fixes: ~25 minutes
