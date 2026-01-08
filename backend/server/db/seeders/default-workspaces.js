import { Workspace } from '../models/index.js';

export async function seedDefaultWorkspaces() {
    const defaults = ['Personal', 'Work'];

    for (const name of defaults) {
        await Workspace.findOrCreate({
            where: { name },
        });
    }
}
