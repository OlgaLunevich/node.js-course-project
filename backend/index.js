import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import http from 'http';
import { WebSocketServer } from 'ws';


const app = express();
const PORT = 5000;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);
const DATA_DIR = path.join(currentDir, 'data');
const UPLOAD_DIR = path.join(currentDir, 'uploads');

const fileOf = (id) => path.join(DATA_DIR, `${id}.json`);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const client of wss.clients) {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(data);
        }
    }
}

wss.on('connection', (ws) => {
    ws.send(
        JSON.stringify({
            type: 'connected',
            message: 'WebSocket connected',
            ts: Date.now(),
        })
    );
});

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(UPLOAD_DIR, { recursive: true })
            .then(() => cb(null, UPLOAD_DIR))
            .catch((err) => cb(err));
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeOriginalName = file.originalname.replace(/[^\w.\-]/g, '_');
        cb(null, `${timestamp}_${safeOriginalName}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only images and PDFs are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

function mapFilesToAttachments(files = []) {
    return files.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        filename: file.filename,
        url: `/uploads/${file.filename}`,
    }));
}

function parseIdsFromBody(value) {
    if (!value) return [];

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((v) => String(v));
            }
        } catch {
            return value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
        }
    }

    if (Array.isArray(value)) {
        return value.map((v) => String(v));
    }

    return [String(value)];
}

function validateArticle(body) {
    const errors = [];

    if (!body || typeof body !== 'object') {
        errors.push('Request body must be an object');
        return errors;
    }

    if (!body.title || !String(body.title).trim()) {
        errors.push('Title is required');
    }

    if (!body.content || !String(body.content).trim()) {
        errors.push('Content is required');
    }

    return errors;
}

app.post('/articles', upload.array('attachments', 5),async (req, res) => {
    try {
        const errors = validateArticle(req.body);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const { title, content } = req.body;

        await fs.mkdir(DATA_DIR, { recursive: true });

        const id = Date.now().toString();
        const attachments = mapFilesToAttachments(req.files || []);
        const payload = { id, title, content, attachments };

        await fs.writeFile(fileOf(id), JSON.stringify(payload, null, 2), 'utf8');

        broadcast({
            type: 'article_created',
            articleId: id,
            title,
            attachmentsAdded: attachments.length,
            message: `Article created: "${title}"`,
            ts: Date.now(),
        });

        res.status(201).json({ message: 'Article created', id });
    } catch (err) {
        console.error(err);
        if (err.message && err.message.startsWith('Unsupported file type')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to save article' });
    }
});

app.put('/articles/:id', upload.array('attachments', 5), async (req, res) => {
    try {
        const id = req.params.id;

        let existing;
        try {
            const raw = await fs.readFile(fileOf(id), 'utf8');
            existing = JSON.parse(raw);
        } catch (e) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const errors = validateArticle(req.body);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const { title, content } = req.body;

        const oldAttachments = Array.isArray(existing.attachments)
            ? existing.attachments
            : [];

        const idsToRemove = parseIdsFromBody(req.body.attachmentsToRemove);

        const removedAttachments = oldAttachments.filter((att) =>
            idsToRemove.includes(String(att.id))
        );

        const keptAttachments = oldAttachments.filter(
            (att) => !idsToRemove.includes(String(att.id))
        );

        for (const att of removedAttachments) {
            if (!att.filename) continue;
            const filePath = path.join(UPLOAD_DIR, att.filename);
            try {
                await fs.unlink(filePath);
            } catch (e) {
                if (e.code !== 'ENOENT') {
                    console.error('Failed to delete attachment file', e);
                }
            }
        }

        const newAttachments = mapFilesToAttachments(req.files || []);

        const payload = {
            id,
            title,
            content,
            attachments: [...keptAttachments, ...newAttachments],
        };

        await fs.writeFile(fileOf(id), JSON.stringify(payload, null, 2), 'utf8');

        const titleChanged = String(existing.title ?? '') !== String(title ?? '');
        const contentChanged = String(existing.content ?? '') !== String(content ?? '');
        const filesAdded = newAttachments.length;
        const filesRemoved = removedAttachments.length;

        if (titleChanged || contentChanged || filesAdded > 0 || filesRemoved > 0) {
            const parts = [];
            if (titleChanged || contentChanged) parts.push('content updated');
            if (filesAdded) parts.push(`+${filesAdded} file(s)`);
            if (filesRemoved) parts.push(`-${filesRemoved} file(s)`);

            broadcast({
                type: 'article_updated',
                articleId: id,
                title,
                attachmentsAdded: filesAdded,
                attachmentsRemoved: filesRemoved,
                message: `Article "${title}" changed: ${parts.join(', ')}`,
                ts: Date.now(),
            });
        }

        res.json({ message: 'Article updated', id });
    } catch (err) {
        console.error(err);
        if (err.message && err.message.startsWith('Unsupported file type')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to update article' });
    }
});


app.get('/articles', async (_, res) => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const files = await fs.readdir(DATA_DIR);

        const articles = await Promise.all(
            files
                .filter((f) => f.endsWith('.json'))
                .map(async (file) => {
                    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
                    const { id, title } = JSON.parse(raw);
                    return { id, title };
                })
        );

        articles.sort((a, b) => Number(b.id) - Number(a.id));

        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read articles' });
    }
});


app.get('/articles/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const raw = await fs.readFile(fileOf(id), 'utf8');
        const article = JSON.parse(raw);
        res.json(article);
    } catch (err) {
        res.status(404).json({ error: 'Article not found' });
    }
});

app.delete('/articles/:id', async (req, res) => {
    try {
        const id = req.params.id;

        let article;
        try {
            const raw = await fs.readFile(fileOf(id), 'utf8');
            article = JSON.parse(raw);
        } catch (e) {
            if (e.code === 'ENOENT') {
                return res.status(404).json({ error: 'Article not found' });
            }
            throw e;
        }

        const title = article?.title ?? 'Unknown article';
        const attachments = Array.isArray(article?.attachments) ? article.attachments : [];

        for (const att of attachments) {
            if (!att?.filename) continue;
            try {
                await fs.unlink(path.join(UPLOAD_DIR, att.filename));
            } catch (e) {
                if (e.code !== 'ENOENT') console.error('Failed to delete attachment file', e);
            }
        }

        await fs.unlink(fileOf(id));

        broadcast({
            type: 'article_deleted',
            articleId: id,
            title,
            message: `Article "${title}" was deleted`,
            ts: Date.now(),
        });

        res.json({ message: 'Article deleted', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

server.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});




