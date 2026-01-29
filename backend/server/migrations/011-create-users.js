import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
    await queryInterface.createTable("users", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: queryInterface.sequelize.literal("gen_random_uuid()"),
        },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.dropTable("users");
}
