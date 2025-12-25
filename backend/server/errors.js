import multer from 'multer';

export function errorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'You can upload up to 5 files.' });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err?.status) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}
