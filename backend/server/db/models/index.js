import { Workspace } from './Workspace.js';
import { Article } from './Article.js';
import { Comment } from './Comment.js';
import { Attachment } from './Attachment.js';

Workspace.hasMany(Article, { foreignKey: 'workspaceId' });
Article.belongsTo(Workspace, { foreignKey: 'workspaceId' });

Article.hasMany(Comment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
Comment.belongsTo(Article, { foreignKey: 'articleId' });

Article.hasMany(Attachment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
Attachment.belongsTo(Article, { foreignKey: 'articleId' });

export { Workspace, Article, Comment, Attachment };
