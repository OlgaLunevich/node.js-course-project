import express from 'express';
import { upload } from '../upload.js';
import {
    listArticles,
    getArticleById,
    createArticle,
    deleteArticle,
    updateArticleWithVersioning,
} from '../repos/articlesRepo.js';
import { deleteFilesByAttachments } from '../helpers/files.helpers.js';
import { isUuid } from '../helpers/validateUuid.js';

function parseIdsFromBody(value) {
    if (!value) return [];

    const normalize = (s) => String(s).trim().replace(/^\[|\]$/g, '');

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.map(normalize).filter(Boolean);
        } catch {
            return value
                .split(',')
                .map(normalize)
                .filter(Boolean);
        }
    }

    if (Array.isArray(value)) return value.map(normalize).filter(Boolean);
    return [normalize(value)].filter(Boolean);
}

function validateArticle(body) {
    const errors = [];

    if (!body || typeof body !== 'object') {
        errors.push('Request body must be an object');
        return errors;
    }
    if (!body.title || !String(body.title).trim()) errors.push('Title is required');
    if (!body.content || !String(body.content).trim()) errors.push('Content is required');

    return errors;
}

export function createArticlesRouter({ broadcast }) {
    const router = express.Router();

    router.post('/articles', upload.array('attachments', 5), async (req, res, next) => {
        try {
            const errors = validateArticle(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const { title, content, workspaceId } = req.body;
            if (!workspaceId || !isUuid(String(workspaceId))) {
                return res.status(400).json({ error: 'Invalid workspaceId' });
            }

            const article = await createArticle({
                title,
                content,
                workspaceId,
                files: req.files ?? [],
            });

            broadcast({
                type: 'article_created',
                articleId: article.id,
                title,
                message: `Article created: "${title}"`,
                ts: Date.now(),
            });

            res.status(201).json({ message: 'Article created', id: article.id });
        } catch (err) {
            next(err);
        }
    });


    router.put('/articles/:id', upload.array('attachments', 5), async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!isUuid(id)) return res.status(400).json({ error: 'Invalid article id' });

            const existing = await getArticleById(id);
            if (!existing) return res.status(404).json({ error: 'Article not found' });

            const errors = validateArticle(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const { title, content, workspaceId } = req.body;
            const idsToRemove = parseIdsFromBody(req.body.attachmentsToRemove);

            console.log(req.body.attachmentsToRemove, idsToRemove)

            const result = await updateArticleWithVersioning(id, {
                title,
                content,
                workspaceId,
                attachmentsToRemove: idsToRemove,
                newFiles: req.files ?? [],
            });

            if (!result) return res.status(404).json({ error: 'Article not found' });
            await deleteFilesByAttachments(result.orphanAttachments);

            broadcast({
                type: 'article_updated',
                articleId: id,
                title,
                message: `Article updated: "${title}"`,
                ts: Date.now(),
            });

            res.json({ message: 'Article updated', id });
        } catch (err) {
            console.error("PUT /articles error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    });


    router.get('/articles', async (req, res, next) => {
        try {
            const workspaceId = req.query.workspaceId ? String(req.query.workspaceId) : undefined;
            const articles = await listArticles({ workspaceId });
            res.json(articles);
        } catch (err) {
            next(err);
        }
    });

    router.get('/articles/:id', async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!isUuid(id)) {
                return res.status(400).json({ error: 'Invalid article id' });
            }

            const version = req.query.version ? Number(req.query.version) : undefined;
            const article = await getArticleById(id, { version });

            if (!article) return res.status(404).json({ error: 'Article not found' });
            res.json(article);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    router.delete('/articles/:id', async (req, res, next) => {
        try {
            const id = req.params.id;
            if (!isUuid(id)) {
                return res.status(400).json({ error: 'Invalid article id' });
            }

            const result = await deleteArticle(id);
            if (!result) return res.status(404).json({ error: 'Article not found' });

            await deleteFilesByAttachments(result.attachments);

            const title = result.article?.title ?? 'Unknown article';
            broadcast({
                type: 'article_deleted',
                articleId: id,
                title,
                message: `Article "${title}" was deleted`,
                ts: Date.now(),
            });

            res.json({ message: 'Article deleted', id });
        } catch (err) {
            next(err);
        }
    });

    return router;
}

