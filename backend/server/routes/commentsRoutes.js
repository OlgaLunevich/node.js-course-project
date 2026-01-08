import express from 'express';
import { isUuid } from '../helpers/validateUuid.js';
import {
    listComments,
    createComment,
    updateComment,
    deleteComment,
} from '../repos/commentsRepo.js';

function validateCommentBody(body) {
    const errors = [];
    if (!body || typeof body !== 'object') {
        errors.push('Request body must be an object');
        return errors;
    }
    if (!body.content || !String(body.content).trim()) errors.push('Content is required');
    return errors;
}

export function createCommentsRouter({ broadcast }) {
    const router = express.Router();

    router.get('/articles/:id/comments', async (req, res, next) => {
        try {
            const articleId = req.params.id;

            if (!isUuid(articleId)) {
                return res.status(400).json({ error: 'Invalid article id' });
            }

            const comments = await listComments(articleId);
            res.json(comments);
        } catch (err) {
            next(err);
        }
    });

    router.post('/articles/:id/comments', async (req, res, next) => {
        try {
            const articleId = req.params.id;

            if (!isUuid(articleId)) {
                return res.status(400).json({ error: 'Invalid article id' });
            }

            const errors = validateCommentBody(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const content = String(req.body.content).trim();
            const comment = await createComment({ articleId, content });

            broadcast?.({
                type: 'comment_created',
                articleId,
                commentId: comment.id,
                ts: Date.now(),
            });

            res.status(201).json(comment);
        } catch (err) {
            next(err);
        }
    });

    router.put('/comments/:commentId', async (req, res, next) => {
        try {
            const id = req.params.commentId;

            if (!isUuid(id)) {
                return res.status(400).json({ error: 'Invalid comment id' });
            }

            const errors = validateCommentBody(req.body);
            if (errors.length) return res.status(400).json({ errors });

            const content = String(req.body.content).trim();

            const updated = await updateComment(id, { content });
            if (!updated) return res.status(404).json({ error: 'Comment not found' });

            broadcast?.({
                type: 'comment_updated',
                articleId: updated.articleId,
                commentId: updated.id,
                ts: Date.now(),
            });

            res.json(updated);
        } catch (err) {
            next(err);
        }
    });

    router.delete('/comments/:commentId', async (req, res, next) => {
        try {
            const id = req.params.commentId;

            if (!isUuid(id)) {
                return res.status(400).json({ error: 'Invalid comment id' });
            }

            const result = await deleteComment(id);
            if (!result) return res.status(404).json({ error: 'Comment not found' });

            broadcast?.({
                type: 'comment_deleted',
                articleId: result.articleId,
                commentId: result.id,
                ts: Date.now(),
            });

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    });

    return router;
}
