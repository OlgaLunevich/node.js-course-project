import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.createTable('workspaces', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: qi.sequelize.literal('gen_random_uuid()'),
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: qi.sequelize.literal('NOW()'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: qi.sequelize.literal('NOW()'),
        },
    });

    await qi.bulkInsert('workspaces', [
        { id: qi.sequelize.literal('gen_random_uuid()'), name: 'Personal', createdAt: qi.sequelize.literal('NOW()'), updatedAt: qi.sequelize.literal('NOW()') },
        { id: qi.sequelize.literal('gen_random_uuid()'), name: 'Work', createdAt: qi.sequelize.literal('NOW()'), updatedAt: qi.sequelize.literal('NOW()') },
    ]);
}

export async function down({ context: qi }) {
    await qi.dropTable('workspaces');
}
