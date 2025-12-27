Wiki Platform (React + Node.js + File Storage)

This is an educational full-stack project: a simplified Wiki system with a visual editor (WYSIWYG) and file-based page storage.

At this stage, the core functionality is implemented: creating and viewing pages.

---

## Features Implemented

| Feature | Status |
|--------|--------|
Create pages | +
View pages | +
Edit existing pages | +
Delete pages | +
WYSIWYG editor (**Tiptap**) | +
Attachements | +
File-based storage (`/backend/data`) | +
REST API (Express) | +
Modal confirm window for deletion | +
Notifications(websockets) | +
React Router navigation (/articles, /articles/:id, /articles/:id/edit) | +
Frontend on React + Vite + TypeScript | +
Clean UI with inline error messages | +
Axios for API requests | +
DB migration (Sequelize + Umzug)| +

---

## Project Goal

Build a simplified wiki-like platform (similar to Confluence / Notion / Wiki.js) as a full-stack learning project.

---

## Technology Stack

### Frontend
- React + Vite + TypeScript
- **Tiptap** WYSIWYG Editor
- Axios

### Backend
- Node.js + Express
- File database using `fs.promises`
- CORS
---

## How to Run

### 1.  Backend

```bash
cd backend
npm install
node index.js

```
Server starts at:

http://localhost:5000

### 2.  Frontend
```bash
cd frontend
npm install
npm run dev
```

Open in browser:

http://localhost:5173

### 3. Migrations

```bash
cd backend
npm install
npm run migrate
npm start
```

## API Endpoints

| Method   | Endpoint | Description |
|----------|-----------|-----------|
| GET | /articles  | Get all pages  |
| GET    | /articles/:id    | Get a page by ID     |
| POST    | /articles     | Create a new page     |
| PUT    | /articles/:id     | Update an existing article     |
| DELETE    | /articles/:id    | /articles/:id     |


Pages are stored as JSON files in backend/data/.

## Current Functionality

- Create a page using WYSIWYG editor

- Save page to filesystem

- List pages

- View selected page

- Edit existing pages (PUT)

- Delete pages with a custom confirmation modal

- Inline error handling (no alert())

- Clean page routing (/articles, /articles/:id, /articles/:id/edit, /articles/new)

- Add notifications (up to 5)

- Real-Time Notifications via WebSockets

- Migration to DB via Sequelize + Umzug

## Roadmap (Next Development Steps)

Planned Feature	Status

| Feature | Status |
|--------|--------|
|WYSIWYG Editor| +      |
|Version control (page history)| -      |
|Attachments (file uploads)| +      |
|Comments| -      |
|Page hierarchy / tree navigation| -      |
|Spaces / Workspaces| -      |
|Full-text search| -      |
|Internal page linking| -      |
|User / Group permissions| -      |
|User management| -      |
|Export to PDF / DOCX| -      |
|Notifications| +      |	

The project is being developed iteratively. Each feature will be added as a separate module.

## Author

Olga Lunevich

Educational Full-stack Project (Node.js + React)

## License

For educational use only.