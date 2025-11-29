import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);
const DATA_DIR = path.join(currentDir, 'data');

const fileOf = (id) => path.join(DATA_DIR, `${id}.json`);
app.use(cors());
app.use(express.json());

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

app.post('/articles', async (req, res) => {
    try {
        const errors = validateArticle(req.body);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const { title, content } = req.body;

        await fs.mkdir(DATA_DIR, { recursive: true });

        const id = Date.now().toString(); // чистый ID
        const payload = { id, title, content };

        await fs.writeFile(fileOf(id), JSON.stringify(payload, null, 2), 'utf8');

        res.status(201).json({ message: 'Article created', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save article' });
    }
});

app.put('/articles/:id', async (req, res) => {
    try {
        const id = req.params.id;

        try {
            await fs.readFile(fileOf(id), 'utf8');
        } catch (e) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const errors = validateArticle(req.body);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const { title, content } = req.body;
        const payload = { id, title, content };

        await fs.writeFile(fileOf(id), JSON.stringify(payload, null, 2), 'utf8');

        res.json({ message: 'Article updated', id });
    } catch (err) {
        console.error(err);
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

        try {
            await fs.unlink(fileOf(id));
        } catch (e) {
            if (e.code === 'ENOENT') {
                return res.status(404).json({ error: 'Article not found' });
            }
            throw e;
        }

        res.json({ message: 'Article deleted', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});


app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});




