import { sequelize } from './server/db/index.js';
import { umzug } from './server/db/migrate.js';

try {
    const pending = await umzug.pending();
    const executed = await umzug.executed();

    console.log('Pending:', pending.map(m => m.name));
    console.log('Executed:', executed.map(m => m.name));

    await umzug.up();

    console.log('Migrations applied');
} catch (err) {
    console.error('Migration failed');
    console.error(err);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
