import { Article, Attachment, Comment, ArticleVersion } from '../db/models/index.js';
import {sequelize} from "../db/index.js";

export async function listArticles({ workspaceId }) {
    const where = workspaceId ? { workspaceId } : undefined;

    const articles = await Article.findAll({
        where,
        include: [{ model: ArticleVersion, as: 'currentVersion' }],
        order: [['updatedAt', 'DESC']],
    });

    return articles.map(a => ({
        id: a.id,
        workspaceId: a.workspaceId,
        title: a.currentVersion?.title ?? a.title,
        content: a.currentVersion?.content ?? a.content,
        version: a.currentVersion?.version ?? 1,
        updatedAt: a.currentVersion?.updatedAt ?? a.updatedAt,
    }));
}

export async function getArticleById(id, { version } = {}) {
    const article = await Article.findByPk(id);
    if (!article) return null;

    let articleVersion;
    if (version!== undefined) {
        articleVersion = await ArticleVersion.findOne({ where: { articleId: id, version } });
    } else {
        articleVersion = await ArticleVersion.findByPk(article.currentVersionId);
    }
    if (!articleVersion) return null;

    const attachments = await articleVersion.getAttachments({
        order: [['createdAt', 'ASC']],
    });

    const comments = await Comment.findAll({
        where: { articleId: id },
        order: [['createdAt', 'ASC']],
    });

    const current = await ArticleVersion.findByPk(article.currentVersionId);

    return {
        id: article.id,
        workspaceId: article.workspaceId,
        title: articleVersion.title,
        content: articleVersion.content,
        version: articleVersion.version,
        isLatest: current?.id === articleVersion.id,
        attachments,
        comments,
    };
}

export async function createArticle({ title, content, workspaceId, files = [] }) {
    return sequelize.transaction(async (t) => {
        const article = await Article.create(
            { title, content, workspaceId },
            { transaction: t }
        );

        const v1 = await ArticleVersion.create(
            { articleId: article.id, version: 1, title, content },
            { transaction: t }
        );

        await article.update({ currentVersionId: v1.id }, { transaction: t });

        if (files.length) {
            await addAttachmentsToVersion(article.id, v1.id, files, { transaction: t });
        }

        return article;
    });
}

export async function deleteArticle(id) {
    const article = await Article.findByPk(id, {
        include: [{ model: Attachment, separate: true }],
    });
    if (!article) return null;

    const attachments = article.Attachments ?? [];

    await article.destroy();
    return { article, attachments };
}

export async function addAttachmentsToVersion(articleId, articleVersionId, files = [], { transaction } = {}) {
    if (!files.length) return [];

    const rows = files.map((f) => ({
        articleId,
        originalName: f.originalname,
        filename: f.filename,
        mimeType: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
    }));

    const created = await Attachment.bulkCreate(rows, { transaction });

    await linkAttachmentsToVersion(
        articleVersionId,
        created.map((a) => a.id),
        { transaction }
    );

    return created;
}

export async function unlinkAttachmentsFromVersion(articleVersionId, attachmentIds, { transaction } = {}) {
    if (!attachmentIds.length) return;

    await sequelize.getQueryInterface().bulkDelete(
        'article_version_attachments',
        { articleVersionId, attachmentId: attachmentIds },
        { transaction }
    );
}

export async function linkAttachmentsToVersion(articleVersionId, attachmentIds, { transaction } = {}) {
    if (!attachmentIds.length) return;

    const rows = attachmentIds.map((attachmentId) => ({
        articleVersionId,
        attachmentId,
    }));

    await sequelize.getQueryInterface().bulkInsert('article_version_attachments', rows, { transaction });
}

export async function deleteOrphanAttachments(attachmentIds, { transaction } = {}) {
    if (!attachmentIds.length) return [];

    const [rows] = await sequelize.query(
        `
        SELECT a.*
        FROM "attachments" a
        LEFT JOIN "article_version_attachments" ava
          ON ava."attachmentId" = a."id"
        WHERE a."id" IN (:ids)
        GROUP BY a."id"
        HAVING COUNT(ava."attachmentId") = 0
        `,
        {
            replacements: { ids: attachmentIds },
            transaction,
        }
    );

    await Attachment.destroy({
        where: { id: rows.map((r) => r.id) },
        transaction,
    });

    return rows;
}

export async function updateArticleWithVersioning(
    articleId,
    { title, content, workspaceId, attachmentsToRemove = [], newFiles = [] }
) {
    return sequelize.transaction(async (t) => {
        const article = await Article.findByPk(articleId, { transaction: t });
        if (!article) return null;

        const currentV = await ArticleVersion.findByPk(article.currentVersionId, { transaction: t });
        if (!currentV) return null;

        const nextVersion = currentV.version + 1;
        const newTitle = title ?? currentV.title;
        const newContent = content ?? currentV.content;

        const newV = await ArticleVersion.create(
            { articleId, version: nextVersion, title: newTitle, content: newContent },
            { transaction: t }
        );

        await sequelize.query(
            `
            INSERT INTO "article_version_attachments" ("articleVersionId", "attachmentId")
            SELECT :newVid, "attachmentId"
            FROM "article_version_attachments"
            WHERE "articleVersionId" = :currentVid
            ON CONFLICT DO NOTHING
            `,
            { replacements: { newVid: newV.id, currentVid: currentV.id }, transaction: t }
        );

        await unlinkAttachmentsFromVersion(newV.id, attachmentsToRemove, { transaction: t });
        await addAttachmentsToVersion(articleId, newV.id, newFiles, { transaction: t });
        await article.update(
            {
                currentVersionId: newV.id,
                workspaceId: workspaceId ?? article.workspaceId,
                title: newTitle,
                content: newContent,
            },
            { transaction: t }
        );

        const orphanAttachments = await deleteOrphanAttachments(attachmentsToRemove, { transaction: t });
        return { article, newVersion: newV, orphanAttachments };
    });
}


export async function listArticleVersions(articleId) {
    const versions = await ArticleVersion.findAll({
        where: { articleId },
        order: [['version', 'DESC']],
        attributes: ['version', 'createdAt', 'id'],
    });

    return versions.map(v => ({
        id: v.id,
        version: v.version,
        createdAt: v.createdAt,
    }));
}
