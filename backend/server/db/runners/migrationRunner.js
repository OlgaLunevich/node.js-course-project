import { pathToFileURL } from 'node:url';

export function createMigrationRunner(migrationPath, context, direction) {
    return async () => {
        const moduleUrl = pathToFileURL(migrationPath).href;
        const m = await import(moduleUrl);

        const fn = m?.[direction];
        if (typeof fn !== 'function') {
            throw new TypeError(
                `Migration "${migrationPath}" does not export a "${direction}" function`
            );
        }

        return fn({ context });
    };
}
