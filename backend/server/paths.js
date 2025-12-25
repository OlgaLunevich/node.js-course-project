import path from 'path';
import { fileURLToPath } from 'url';

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);

export const BACKEND_DIR = path.join(currentDir, '..');

export const DATA_DIR = path.join(BACKEND_DIR, 'data');
export const UPLOAD_DIR = path.join(BACKEND_DIR, 'uploads');

export const fileOf = (id) => path.join(DATA_DIR, `${id}.json`);
