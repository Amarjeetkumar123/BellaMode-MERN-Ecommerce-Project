const multer = require('multer');

// In-memory storage — the upload service streams the buffer straight to Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});

module.exports = upload;
