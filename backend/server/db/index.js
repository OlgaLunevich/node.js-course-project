import 'dotenv/config';
import { Sequelize } from 'sequelize';

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_SSL,
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: Number(DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions:
        DB_SSL === 'true'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : undefined,
});

export async function checkDbConnection() {
    await sequelize.authenticate();
}
