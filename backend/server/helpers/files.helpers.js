import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR } from '../paths.js';

export async function deleteFilesByAttachments(attachments = []) {
    for (const att of attachments) {
        if (!att?.filename) continue;
        try {
            await fs.unlink(path.join(UPLOAD_DIR, att.filename));
        } catch (e) {
            if (e.code !== 'ENOENT') console.error('Failed to delete attachment file', e);
        }
    }
}
