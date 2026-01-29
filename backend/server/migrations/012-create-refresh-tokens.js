import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
    await queryInterface.createTable("refresh_tokens", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: queryInterface.sequelize.literal("gen_random_uuid()"),
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("refresh_tokens", ["userId"]);
    await queryInterface.addIndex("refresh_tokens", ["expiresAt"]);
}

export async function down({ context: queryInterface }) {
    await queryInterface.dropTable("refresh_tokens");
}

