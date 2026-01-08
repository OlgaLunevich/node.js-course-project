import { Comment } from '../db/models/index.js';

export async function listComments(articleId) {
    return Comment.findAll({
        where: { articleId },
        order: [['createdAt', 'ASC']],
    });
}

export async function createComment({ articleId, content }) {
    return Comment.create({ articleId, content });
}

export async function updateComment(id, { content }) {
    const comment = await Comment.findByPk(id);
    if (!comment) return null;

    if (content !== undefined) comment.content = content;
    await comment.save();

    return comment;
}

export async function deleteComment(id) {
    const comment = await Comment.findByPk(id);
    if (!comment) return null;

    const articleId = comment.articleId;
    await comment.destroy();

    return { id, articleId };
}
