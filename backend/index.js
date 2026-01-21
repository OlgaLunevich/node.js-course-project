import './server/db/models/initModels.js';
import { createWorkspacesRouter } from './server/routes/workspacesRoutes.js';
import express from 'express';
import cors from 'cors';
import http from 'http';

import { UPLOAD_DIR } from './server/paths.js';
import { initWs } from './server/ws.js';
import { createArticlesRouter } from './server/routes/articlesRoutes.js';
import { createCommentsRouter } from './server/routes/commentsRoutes.js';
import { createAuthRouter} from "./server/routes/authRoutes.js";
import { requireAuth} from "./server/middleware/requireAuth.js";

import { errorHandler } from './server/errors.js';
import { checkDbConnection } from './server/db/index.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use("/auth", createAuthRouter());


const server = http.createServer(app);
const { broadcast } = initWs(server);

app.use(requireAuth);
app.use(createArticlesRouter({ broadcast }));
app.use(createCommentsRouter({ broadcast }));

app.use(createWorkspacesRouter());
app.use(errorHandler);

await checkDbConnection();
console.log('DB connected');

server.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});




