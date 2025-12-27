import { Umzug, SequelizeStorage } from 'umzug';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sequelize } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsGlob = path
    .join(__dirname, '..', 'migrations', '*.js')
    .replaceAll('\\', '/');

export const umzug = new Umzug({
    migrations: {
        glob: migrationsGlob,
        resolve: ({ name, path: migrationPath, context }) => {
            return {
                name,
                up: async () => {
                    const m = await import(pathToFileURL(migrationPath).href);
                    return m.up({ context });
                },
                down: async () => {
                    const m = await import(pathToFileURL(migrationPath).href);
                    return m.down({ context });
                },
            };
        },
    },

    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

export async function migrateUp() {
    await umzug.up();
}

export async function migrateDown() {
    await umzug.down();
}
