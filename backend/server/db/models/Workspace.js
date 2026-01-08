import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Workspace = sequelize.define('Workspace', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'workspaces' });
