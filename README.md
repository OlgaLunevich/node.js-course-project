Wiki Platform (React + Node.js + File Storage)

This is an educational full-stack project: a simplified Wiki system with a visual editor (WYSIWYG),
database-backed storage, file attachments, comments, real-time updates, and workspace-based article organization.

---

## Features Implemented

| Feature | Status |
|--------|--------|
WYSIWYG editor (**Tiptap**) | +
Articles CRUD (DB persisted) | +
Article versioning (history, read-only old versions) | +
Comments CRUD (DB persisted) | +
Workspaces (article grouping) | +
Workspace switching (UI) | +
File attachments (images, PDF) | +
File-based storage (`/backend/data`) - legacy| + 
REST API (Express) | +
Modal confirm window for deletion | +
Notifications(websockets) | +
React Router navigation (/articles, /articles/:id, /articles/:id/edit) | +
Frontend on React + Vite + TypeScript | +
Clean UI with inline error messages | +
Axios for API requests | +
PostgreSQL database | +
Sequelize ORM | +
DB migration (Sequelize + Umzug)| +
Auth + protected pages | +

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
- File database using `fs.promises` - used previously
- PostgreSQL
- Sequelize ORM
- Sequelize migrations (Umzug)
- WebSockets (ws) for real-time updates
- Multer for file uploads
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

The project uses environment variables for configuration. 
Before running the application, you need to create a .env file based on .env.example.

Important:

The .env.example file intentionally does not contain real secrets (such as passwords).
You must set them manually in your local .env file.

Database Setup:

Before running migrations, the database must be created manually.
Running migrations without an existing database will cause an error.

Create Database:

You can create the database using pgAdmin or SQL.

Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
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


“Articles and related entities are stored in PostgreSQL (Sequelize). Attachments are stored on disk.”


### Authentication (JWT + httpOnly Refresh Cookie)

The application implements a full authentication flow:

- Users can register with email + password (password is stored as a secure bcrypt hash).

- Users can log in and receive a short-lived JWT access token.

- A long-lived refresh token is stored in an httpOnly cookie (not accessible from JavaScript).

- All protected API routes reject requests without a valid JWT (401 Unauthorized).

- The frontend has public pages (/login, /register) and a protected area (all other routes).

- When the access token expires, the frontend automatically calls /auth/refresh (cookie-based) to obtain a new access token.

## Auth Endpoints

| Method | Endpoint         | Description                                               |
| ------ | ---------------- | --------------------------------------------------------- |
| POST   | `/auth/register` | Register a user (`email`, `password`)                     |
| POST   | `/auth/login`    | Login and receive `{ accessToken }` + sets refresh cookie |
| POST   | `/auth/refresh`  | Returns `{ accessToken }` (requires refresh cookie)       |
| POST   | `/auth/logout`   | Invalidates refresh token and clears cookie               |
| GET    | `/auth/me`       | Returns current user profile (JWT required)               |

Note: refresh token is not returned in JSON. It is stored in a httpOnly cookie (refreshToken, Path=/auth).

## Protected API Access

All application API endpoints (articles, comments, workspaces, etc.) require a valid JWT access token:

Missing/invalid/expired token - 401 Unauthorized

Frontend redirects to /login when user is not authenticated.

## Frontend Auth Notes

Access token is managed via an Auth Context (prepared for future role-based tasks).

API requests are made through a shared Axios instance (axiosClient) which automatically uses the current access token.

Refresh token is stored only in httpOnly cookie (frontend cannot read it directly).



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

- Add comments

- Workspaces

## Article Versioning

Articles use a versioned data model.

- Each article update creates a new immutable version instead of overwriting existing data
- Older versions remain accessible in read-only mode
- The UI clearly indicates when an old version is being viewed
- Editing and deletion are disabled for non-latest versions



## Roadmap (Next Development Steps)

Planned Feature	Status

| Feature | Status |
|--------|--------|
|WYSIWYG Editor| +      |
|Version control (page history)| +      |
|Attachments (file uploads)| +      |
|Comments| +      |
|Page hierarchy / tree navigation| -      |
|Spaces / Workspaces| +      |
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
