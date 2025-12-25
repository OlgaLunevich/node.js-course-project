import fs from 'fs/promises';
import path from 'path';
import { DATA_DIR, fileOf } from './paths.js';

export async function ensureDataDir() {
    await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function listArticles() {
    await ensureDataDir();
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
    return articles;
}

export async function readArticle(id) {
    const raw = await fs.readFile(fileOf(id), 'utf8');
    return JSON.parse(raw);
}

export async function writeArticle(id, payload) {
    await ensureDataDir();
    await fs.writeFile(fileOf(id), JSON.stringify(payload, null, 2), 'utf8');
}

export async function deleteArticleFile(id) {
    await fs.unlink(fileOf(id));
}
