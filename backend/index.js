import express from 'express';
import cors from 'cors';
import http from 'http';

import { UPLOAD_DIR } from './server/paths.js';
import { initWs } from './server/ws.js';
import { createArticlesRouter } from './server/articlesRoutes.js';
import { errorHandler } from './server/errors.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const server = http.createServer(app);
const { broadcast } = initWs(server);

app.use(createArticlesRouter({ broadcast }));

app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});




