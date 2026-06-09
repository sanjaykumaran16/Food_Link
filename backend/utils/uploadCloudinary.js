const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const cloudinarySetupHint =
  'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env (free tier: https://cloudinary.com/users/register_free)';

const uploadBuffer = (buffer, folder = 'foodlink') =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error(`Cloudinary is not configured. ${cloudinarySetupHint}`));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

module.exports = { uploadBuffer, isCloudinaryConfigured, cloudinarySetupHint };
