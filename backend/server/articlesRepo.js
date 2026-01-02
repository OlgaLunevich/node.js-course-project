import { Article, Attachment, Comment } from './db/models/index.js';

export async function listArticles({ workspaceId }) {
    const where = workspaceId ? { workspaceId } : undefined;
    return Article.findAll({
        where,
        order: [['updatedAt', 'DESC']],
        include: [
            { model: Attachment, separate: true, order: [['createdAt', 'ASC']] },
        ],
    });
}

export async function getArticleById(id) {
    return Article.findByPk(id, {
        include: [
            { model: Attachment, separate: true, order: [['createdAt', 'ASC']] },
            { model: Comment, separate: true, order: [['createdAt', 'ASC']] },
        ],
    });
}

export async function createArticle({ title, content, workspaceId }) {
    return Article.create({ title, content, workspaceId });
}

export async function updateArticle(id, { title, content, workspaceId }) {
    const article = await Article.findByPk(id);
    if (!article) return null;

    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (workspaceId !== undefined) article.workspaceId = workspaceId;

    await article.save();
    return article;
}
export async function deleteArticle(id) {
    const article = await Article.findByPk(id, {
        include: [{ model: Attachment, separate: true }],
    });
    if (!article) return null;

    const attachments = article.Attachments ?? [];

    await article.destroy(); // comments/attachments каскадно в БД
    return { article, attachments };
}

export async function addAttachments(articleId, files = []) {
    if (!files.length) return [];

    const rows = files.map((f) => ({
        articleId,
        originalName: f.originalname,
        filename: f.filename,
        mimeType: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
    }));

    await Attachment.bulkCreate(rows);

    return Attachment.findAll({
        where: { articleId },
        order: [['createdAt', 'ASC']],
    });
}


export async function removeAttachments(articleId, attachmentIds = []) {
    if (!attachmentIds.length) return [];

    const attachments = await Attachment.findAll({
        where: { articleId, id: attachmentIds },
        order: [['createdAt', 'ASC']],
    });

    await Attachment.destroy({
        where: { articleId, id: attachmentIds },
    });

    return attachments;
}
