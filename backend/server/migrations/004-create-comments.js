import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.createTable('comments', {
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
        content: {
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

    await qi.addConstraint('comments', {
        fields: ['articleId'],
        type: 'foreign key',
        name: 'fk_comments_articleId',
        references: { table: 'articles', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    await qi.addIndex('comments', ['articleId']);
}

export async function down({ context: qi }) {
    await qi.dropTable('comments');
}
