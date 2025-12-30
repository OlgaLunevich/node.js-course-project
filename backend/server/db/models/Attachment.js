import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Attachment = sequelize.define('Attachment', {
    id: { type: DataTypes.UUID, primaryKey: true },
    articleId: { type: DataTypes.UUID, allowNull: false },
    originalName: { type: DataTypes.TEXT, allowNull: false },
    filename: { type: DataTypes.TEXT, allowNull: false },
    mimeType: { type: DataTypes.TEXT, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'attachments' });
