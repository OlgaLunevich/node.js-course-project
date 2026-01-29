export async function up({ context: qi }) {
    await qi.sequelize.query(`
    CREATE TABLE "article_version_attachments" (
      "articleVersionId" UUID NOT NULL REFERENCES "article_versions"("id") ON DELETE CASCADE,
      "attachmentId" UUID NOT NULL REFERENCES "attachments"("id") ON DELETE CASCADE,
      PRIMARY KEY ("articleVersionId", "attachmentId")
    );
  `);

    await qi.sequelize.query(`
    CREATE INDEX "idx_ava_attachmentId" ON "article_version_attachments" ("attachmentId");
  `);
}

export async function down({ context: qi }) {
    await qi.sequelize.query(`DROP TABLE IF EXISTS "article_version_attachments";`);
}
