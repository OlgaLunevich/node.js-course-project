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

function sanitizeFilename(name) {
    return name
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 200) || 'article';
}


app.post('/articles', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

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

        // свежие сверху по id-таймстемпу
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

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});






// import express from 'express';
// import cors from 'cors';
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
//
// const app = express();
// const PORT = 5000;
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// const DATA_DIR = path.join(__dirname, 'data');
//
// app.use(cors());
// app.use(express.json());
//
// function sanitizeFilename(name) {
//     return name
//         .replace(/[/\\?%*:|"<>]/g, '')
//         .replace(/\s+/g, '_')
//         .slice(0, 200) || 'article';
// }
//
// app.post('/articles', async (req, res) => {
//     try {
//         const { title, content } = req.body;
//
//         if (!title || !content) {
//             return res.status(400).json({ error: 'Title and content are required' });
//         }
//
//         await fs.mkdir(DATA_DIR, { recursive: true });
//
//         const fileName = `${Date.now()}_${sanitizeFilename(title)}.json`;
//         const filePath = path.join(DATA_DIR, fileName);
//
//         await fs.writeFile(
//             filePath,
//             JSON.stringify({ title, content }, null, 2),
//             'utf8'
//         );
//
//         res.status(201).json({ message: 'Article created', id: fileName });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to save article' });
//     }
// });
//
// app.get('/articles', async (_, res) => {
//     try {
//         await fs.mkdir(DATA_DIR, { recursive: true });
//         const files = await fs.readdir(DATA_DIR);
//
//         const articles = await Promise.all(
//             files.map(async (file) => {
//                 const content = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
//                 const parsed = JSON.parse(content);
//                 return { id: file, title: parsed.title };
//             })
//         );
//
//         res.json(articles);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to read articles' });
//     }
// });
//
// app.get('/articles/:id', async (req, res) => {
//     try {
//         const filePath = path.join(DATA_DIR, req.params.id);
//         const content = await fs.readFile(filePath, 'utf8');
//         const article = JSON.parse(content);
//         res.json(article);
//     } catch (err) {
//         res.status(404).json({ error: 'Article not found' });
//     }
// });
//
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });
