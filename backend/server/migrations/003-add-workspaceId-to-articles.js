import { DataTypes } from 'sequelize';

export async function up({ context: qi }) {
    await qi.addColumn('articles', 'workspaceId', {
        type: DataTypes.UUID,
        allowNull: true,
    });

    await qi.addConstraint('articles', {
        fields: ['workspaceId'],
        type: 'foreign key',
        name: 'fk_articles_workspaceId',
        references: {
            table: 'workspaces',
            field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
    });

    await qi.sequelize.query(`
    UPDATE "articles"
    SET "workspaceId" = (SELECT id FROM "workspaces" ORDER BY "createdAt" ASC LIMIT 1)
    WHERE "workspaceId" IS NULL;
  `);

    await qi.changeColumn('articles', 'workspaceId', {
        type: DataTypes.UUID,
        allowNull: false,
    });
}

export async function down({ context: qi }) {
    await qi.removeConstraint('articles', 'fk_articles_workspaceId');
    await qi.removeColumn('articles', 'workspaceId');
}
