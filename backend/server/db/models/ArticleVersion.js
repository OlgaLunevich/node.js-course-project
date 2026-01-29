import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const ArticleVersion = sequelize.define('ArticleVersion', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    articleId: { type: DataTypes.UUID, allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'article_versions' });
