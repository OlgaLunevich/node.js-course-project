import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.addColumn('articles', 'currentVersionId', {
        type: DataTypes.UUID,
        allowNull: true,
    });

    await qi.addConstraint('articles', {
        fields: ['currentVersionId'],
        type: 'foreign key',
        name: 'fk_articles_currentVersion',
        references: {
            table: 'article_versions',
            field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
}

export async function down({ context: qi }) {
    await qi.removeConstraint('articles', 'fk_articles_currentVersion');
    await qi.removeColumn('articles', 'currentVersionId');
}
