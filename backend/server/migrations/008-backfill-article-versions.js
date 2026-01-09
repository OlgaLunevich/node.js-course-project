export async function up({ context: qi }) {
    const [articles] = await qi.sequelize.query(`
        SELECT id, title, content FROM articles
    `);

    for (const article of articles) {
        const [[version]] = await qi.sequelize.query(`
            INSERT INTO article_versions ("articleId", version, title, content, "createdAt", "updatedAt")
            VALUES ('${article.id}', 1, ${qi.sequelize.escape(article.title)}, ${qi.sequelize.escape(article.content)}, NOW(), NOW())
            RETURNING id
        `);

        await qi.sequelize.query(`
            UPDATE articles
            SET "currentVersionId" = '${version.id}'
            WHERE id = '${article.id}'
        `);
    }
}

export async function down() {
    // //////////////
}
