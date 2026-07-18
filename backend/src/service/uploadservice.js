const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { asyncHandler, sendSuccess, sendError } = require('../utils/commonUtils');

const DEFAULT_FOLDER = 'wearly';

// Streams an in-memory file buffer to Cloudinary.
function uploadBufferToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: folder || DEFAULT_FOLDER }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
}

// POST /api/upload  — multipart file field "image"
exports.uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) return sendError(res, 400, 'No image file provided (field name must be "image").');
    if (!isCloudinaryConfigured()) {
        return sendError(res, 503, 'Image upload is not configured. Set CLOUDINARY_* env vars, or paste an image URL instead.');
    }
    const result = await uploadBufferToCloudinary(req.file.buffer, req.body.folder);
    return sendSuccess(res, 201, 'Image uploaded successfully.', { url: result.secure_url, publicId: result.public_id });
});

// POST /api/upload/url  — { imageUrl }
exports.uploadByUrl = asyncHandler(async (req, res) => {
    const { imageUrl, folder } = req.body;
    // With Cloudinary configured we ingest the remote URL (durable, transformable);
    // otherwise we simply echo the URL so admins can still paste a link.
    if (isCloudinaryConfigured()) {
        const result = await cloudinary.uploader.upload(imageUrl, { folder: folder || DEFAULT_FOLDER });
        return sendSuccess(res, 201, 'Image saved successfully.', { url: result.secure_url, publicId: result.public_id });
    }
    return sendSuccess(res, 201, 'Image URL saved.', { url: imageUrl });
});
