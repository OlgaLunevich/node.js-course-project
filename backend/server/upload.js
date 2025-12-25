import multer from 'multer';
import fs from 'fs/promises';
import { UPLOAD_DIR } from './paths.js';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(UPLOAD_DIR, { recursive: true })
            .then(() => cb(null, UPLOAD_DIR))
            .catch((err) => cb(err));
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeOriginalName = file.originalname.replace(/[^\w.\-]/g, '_');
        cb(null, `${timestamp}_${safeOriginalName}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error('Unsupported file type. Only images and PDFs are allowed.');
        err.status = 400;
        cb(err);
    }
};

export const upload = multer({ storage, fileFilter, limits: { files: 5 } });
