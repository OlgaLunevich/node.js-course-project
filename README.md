Wiki Platform (React + Node.js + File Storage)

This is an educational full-stack project: a simplified Wiki system with a visual editor (WYSIWYG) and file-based page storage.

At this stage, the core functionality is implemented: creating and viewing pages.

---

## Features Implemented

| Feature | Status |
|--------|--------|
Create pages | +
View pages | +
WYSIWYG editor (**Tiptap**) | +
File-based storage (`/backend/data`) | +
REST API (Express) | +
Frontend on React + Vite + TypeScript | +
Axios for API requests | +

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

## API Endpoints

| Method   | Endpoint | Description |
|----------|-----------|-----------|
| GET | /articles  | Get all pages  |
| GET    | /articles/:id    | Get a page by ID     |
| POST    | /articles     | Create a new page     |

Pages are stored as JSON files in backend/data/.

## Current Functionality

- Create a page using WYSIWYG editor

- Save page to filesystem

- List pages

- View selected page

## Roadmap (Next Development Steps)

Planned Feature	Status

| Feature | Status |
|--------|--------|
|WYSIWYG Editor| +      |
|Version control (page history)| -      |
|Attachments (file uploads)| -      |
|Comments| -      |
|Page hierarchy / tree navigation| -      |
|Spaces / Workspaces| -      |
|Full-text search| -      |
|Internal page linking| -      |
|User / Group permissions| -      |
|User management| -      |
|Export to PDF / DOCX| -      |
|Notificationsr| -      |	

The project is being developed iteratively. Each feature will be added as a separate module.

## Author

Olga Lunevich

Educational Full-stack Project (Node.js + React)

## License

For educational use only.