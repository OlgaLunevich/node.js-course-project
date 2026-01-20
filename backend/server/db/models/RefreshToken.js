import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const RefreshToken = sequelize.define(
    "RefreshToken",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: { type: DataTypes.UUID, allowNull: false },
        tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
        tableName: "refresh_tokens",
    }
);
