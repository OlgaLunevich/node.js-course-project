export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await queryInterface.createTable('articles', {
        id: {
            type: 'UUID',
            allowNull: false,
            primaryKey: true,
            defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
        },
        title: {
            type: 'TEXT',
            allowNull: false,
        },
        content: {
            type: 'TEXT',
            allowNull: false,
        },
        createdAt: {
            type: 'TIMESTAMP WITH TIME ZONE',
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('NOW()'),
        },
        updatedAt: {
            type: 'TIMESTAMP WITH TIME ZONE',
            allowNull: false,
            defaultValue: queryInterface.sequelize.literal('NOW()'),
        },
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.dropTable('articles');
}
