import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.createTable('attachments', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: qi.sequelize.literal('gen_random_uuid()'),
        },
        articleId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        originalName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        filename: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        mimeType: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
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

    await qi.addConstraint('attachments', {
        fields: ['articleId'],
        type: 'foreign key',
        name: 'fk_attachments_articleId',
        references: { table: 'articles', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    await qi.addIndex('attachments', ['articleId']);
}

export async function down({ context: qi }) {
    await qi.dropTable('attachments');
}
