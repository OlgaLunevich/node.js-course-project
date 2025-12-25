import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR } from '../paths.js';
import { readArticle } from '../articlesRepo.js';

export async function loadExistingArticleOr404(id, res) {
    try {
        return await readArticle(id);
    } catch {
        res.status(404).json({ error: 'Article not found' });
        return null;
    }
}

export function splitAttachmentsByRemoveIds(oldAttachments, idsToRemove) {
    const removed = oldAttachments.filter((att) => idsToRemove.includes(String(att.id)));
    const kept = oldAttachments.filter((att) => !idsToRemove.includes(String(att.id)));
    return { removed, kept };
}

export async function deleteAttachmentFiles(attachments) {
    for (const att of attachments) {
        if (!att?.filename) continue;
        try {
            await fs.unlink(path.join(UPLOAD_DIR, att.filename));
        } catch (e) {
            if (e.code !== 'ENOENT') {
                console.error('Failed to delete attachment file', e);
            }
        }
    }
}

export function buildUpdatedPayload({ id, title, content, keptAttachments, newAttachments }) {
    return {
        id,
        title,
        content,
        attachments: [...keptAttachments, ...newAttachments],
    };
}

export function computeArticleDiff(existing, nextTitle, nextContent, newAttachments, removedAttachments) {
    const titleChanged = String(existing.title ?? '') !== String(nextTitle ?? '');
    const contentChanged = String(existing.content ?? '') !== String(nextContent ?? '');
    const filesAdded = newAttachments.length;
    const filesRemoved = removedAttachments.length;

    return { titleChanged, contentChanged, filesAdded, filesRemoved };
}

export function buildUpdateMessageParts(diff) {
    const parts = [];
    if (diff.titleChanged || diff.contentChanged) parts.push('content updated');
    if (diff.filesAdded) parts.push(`+${diff.filesAdded} file(s)`);
    if (diff.filesRemoved) parts.push(`-${diff.filesRemoved} file(s)`);
    return parts;
}

export function maybeBroadcastArticleUpdated({ broadcast, id, title, diff, parts }) {
    if (!parts.length) return;

    broadcast({
        type: 'article_updated',
        articleId: id,
        title,
        attachmentsAdded: diff.filesAdded,
        attachmentsRemoved: diff.filesRemoved,
        message: `Article "${title}" changed: ${parts.join(', ')}`,
        ts: Date.now(),
    });
}
