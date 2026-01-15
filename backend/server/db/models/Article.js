import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Article = sequelize.define('Article', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    currentVersionId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    workspaceId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'articles' });

