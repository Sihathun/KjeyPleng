import cloudinary from '../config/cloudinary.js';

/**
 * Upload a single image buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadImage = async (fileBuffer, folder = 'kjeypleng/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Limit size
          { quality: 'auto' }, // Auto optimize quality
          { fetch_format: 'auto' }, // Auto format (webp, etc.)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<{buffer: Buffer}>} files - Array of file objects from multer
 * @param {string} folder - The folder to upload to
 * @returns {Promise<Array<{url: string, public_id: string}>>}
 */
export const uploadMultipleImages = async (files, folder = 'kjeypleng/products') => {
  const uploadPromises = files.map((file) => uploadImage(file.buffer, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise}
 */
export const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of public_ids to delete
 * @returns {Promise}
 */
export const deleteMultipleImages = async (publicIds) => {
  const deletePromises = publicIds.map((id) => deleteImage(id));
  return Promise.all(deletePromises);
};
