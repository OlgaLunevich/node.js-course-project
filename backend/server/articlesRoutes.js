import express from 'express';
import fs from 'fs/promises';
import path from 'path';

import { upload } from './upload.js';
import { UPLOAD_DIR } from './paths.js';
import { listArticles, readArticle, writeArticle, deleteArticleFile } from './articlesRepo.js';
import {
    loadExistingArticleOr404,
    splitAttachmentsByRemoveIds,
    deleteAttachmentFiles,
    buildUpdatedPayload,
    computeArticleDiff,
    buildUpdateMessageParts,
    maybeBroadcastArticleUpdated,
} from './helpers/articles.helpers.js';

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

            const { title, content } = req.body;
            const id = Date.now().toString();

            const attachments = mapFilesToAttachments(req.files || []);
            const payload = { id, title, content, attachments };

            await writeArticle(id, payload);

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
            next(err);
        }
    });


    router.put('/articles/:id', upload.array('attachments', 5), async (req, res, next) => {
        try {
            const id = req.params.id;

            const existing = await loadExistingArticleOr404(id, res);
            if (!existing) return;

            const errors = validateArticle(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const { title, content } = req.body;

            const oldAttachments = Array.isArray(existing.attachments) ? existing.attachments : [];
            const idsToRemove = parseIdsFromBody(req.body.attachmentsToRemove);

            const { removed: removedAttachments, kept: keptAttachments } =
                splitAttachmentsByRemoveIds(oldAttachments, idsToRemove);

            await deleteAttachmentFiles(removedAttachments);

            const newAttachments = mapFilesToAttachments(req.files || []);

            const payload = buildUpdatedPayload({
                id,
                title,
                content,
                keptAttachments,
                newAttachments,
            });

            await writeArticle(id, payload);

            const diff = computeArticleDiff(existing, title, content, newAttachments, removedAttachments);
            const parts = buildUpdateMessageParts(diff);

            maybeBroadcastArticleUpdated({
                broadcast,
                id,
                title,
                diff,
                parts,
            });

            res.json({ message: 'Article updated', id });
        } catch (err) {
            next(err);
        }
    });


    router.get('/articles', async (req, res, next) => {
        try {
            const articles = await listArticles();
            res.json(articles);
        } catch (err) {
            next(err);
        }
    });

    router.get('/articles/:id', async (req, res) => {
        try {
            const article = await readArticle(req.params.id);
            res.json(article);
        } catch {
            res.status(404).json({ error: 'Article not found' });
        }
    });

    router.delete('/articles/:id', async (req, res, next) => {
        try {
            const id = req.params.id;

            let article;
            try {
                article = await readArticle(id);
            } catch {
                return res.status(404).json({ error: 'Article not found' });
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

            await deleteArticleFile(id);

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
