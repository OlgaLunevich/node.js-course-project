export async function up({ context: qi }) {
    await qi.sequelize.query(`
    CREATE TABLE "article_versions" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "articleId" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
      "version" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "uq_article_versions_article_version" UNIQUE ("articleId", "version")
    );
  `);
}

export async function down({ context: qi }) {
    await qi.sequelize.query(`DROP TABLE IF EXISTS "article_versions";`);
}