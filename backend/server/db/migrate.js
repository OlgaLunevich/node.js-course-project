import { Umzug, SequelizeStorage } from 'umzug';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sequelize } from './index.js';
import { createMigrationRunner } from './migrationRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsGlob = path
    .join(__dirname, '..', 'migrations', '*.js')
    .replaceAll('\\', '/');

export const umzug = new Umzug({
    migrations: {
        glob: migrationsGlob,
        resolve: ({ name, path: migrationPath, context }) => ({
            name,
            up: createMigrationRunner(migrationPath, context, 'up'),
            down: createMigrationRunner(migrationPath, context, 'down'),
        }),
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
