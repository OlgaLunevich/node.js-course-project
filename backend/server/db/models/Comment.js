import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    articleId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'comments' });
