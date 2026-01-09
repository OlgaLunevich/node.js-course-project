import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.createTable('article_versions', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: qi.sequelize.literal('gen_random_uuid()'),
        },
        articleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                table: 'articles',
                field: 'id',
            },
            onDelete: 'CASCADE',
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.TEXT,
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

    await qi.addConstraint('article_versions', {
        fields: ['articleId', 'version'],
        type: 'unique',
        name: 'uq_article_versions_article_version',
    });
}

export async function down({ context: qi }) {
    await qi.dropTable('article_versions');
}
