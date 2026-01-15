import { Workspace } from './Workspace.js';
import { Article } from './Article.js';
import { Comment } from './Comment.js';
import { Attachment } from './Attachment.js';
import { ArticleVersion } from "./ArticleVersion.js";

Workspace.hasMany(Article, { foreignKey: 'workspaceId' });
Article.belongsTo(Workspace, { foreignKey: 'workspaceId' });

Article.hasMany(Comment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
Comment.belongsTo(Article, { foreignKey: 'articleId' });

Article.hasMany(Attachment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
Attachment.belongsTo(Article, { foreignKey: 'articleId' });

Article.hasMany(ArticleVersion, { foreignKey: 'articleId', onDelete: 'CASCADE' });
ArticleVersion.belongsTo(Article, { foreignKey: 'articleId' });
ArticleVersion.belongsToMany(Attachment, {
    through: 'article_version_attachments',
    foreignKey: 'articleVersionId',
    otherKey: 'attachmentId',
    as: 'attachments',
    timestamps: false,
});

Article.belongsTo(ArticleVersion, {
    foreignKey: 'currentVersionId',
    as: 'currentVersion',
});

Attachment.belongsToMany(ArticleVersion, {
    through: 'article_version_attachments',
    foreignKey: 'attachmentId',
    otherKey: 'articleVersionId',
    as: 'versions',
    timestamps: false,
});

export { Workspace, Article, Comment, Attachment, ArticleVersion };
