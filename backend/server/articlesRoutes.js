import express from 'express';
import { upload } from './upload.js';
import {
    listArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    addAttachments,
    removeAttachments,
} from './articlesRepo.js';
import { deleteFilesByAttachments } from './helpers/files.helpers.js';
import { isUuid } from './helpers/validateUuid.js';

function parseIdsFromBody(value) {
    if (!value) return [];

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        } catch {
            return value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
        }
    }

    if (Array.isArray(value)) return value.map((v) => String(v));
    return [String(value)];
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

            const article = await createArticle({ title, content, workspaceId });

            if (req.files?.length) {
                await addAttachments(article.id, req.files);
            }

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
            if (!isUuid(id)) {
                return res.status(400).json({ error: 'Invalid article id' });
            }

            const existing = await getArticleById(id);
            if (!existing) return res.status(404).json({ error: 'Article not found' });

            const errors = validateArticle(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const { title, content, workspaceId } = req.body;
            const idsToRemove = parseIdsFromBody(req.body.attachmentsToRemove);
            if (idsToRemove.length) {
                const removed = await removeAttachments(id, idsToRemove);
                await deleteFilesByAttachments(removed);
            }
            if (req.files?.length) {
                await addAttachments(id, req.files);
            }
            await updateArticle(id, { title, content, workspaceId });

            broadcast({
                type: 'article_updated',
                articleId: id,
                title,
                message: `Article updated: "${title}"`,
                ts: Date.now(),
            });

            res.json({ message: 'Article updated', id });
        } catch (err) {
            next(err);
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

            const article = await getArticleById(id);
            if (!article) return res.status(404).json({ error: 'Article not found' });
            res.json(article);
        } catch (err) {
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

