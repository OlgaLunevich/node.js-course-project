export async function up({ context: qi }) {
    await qi.sequelize.query(`
    INSERT INTO "article_version_attachments" ("articleVersionId", "attachmentId")
    SELECT a."currentVersionId", att."id"
    FROM "articles" a
    JOIN "attachments" att ON att."articleId" = a."id"
    WHERE a."currentVersionId" IS NOT NULL
    ON CONFLICT DO NOTHING;
  `);
}

export async function down() {
}
