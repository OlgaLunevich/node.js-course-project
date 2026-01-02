import { Router } from 'express';
import { Workspace } from './db/models/index.js';

export function createWorkspacesRouter() {
    const router = Router();

    router.get('/workspaces', async (_req, res, next) => {
        try {
            const workspaces = await Workspace.findAll({ order: [['createdAt', 'ASC']] });
            res.json(workspaces);
        } catch (err) {
            next(err);
        }
    });

    return router;
}
