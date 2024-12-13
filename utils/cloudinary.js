import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload files directly to Cloudinary
export const uploadOnCloudinary = async (
  fileBuffer,
  resourceType = 'image'
) => {
  return new Promise((resolve, reject) => {
    // Ensure the fileBuffer is a Buffer, if it's an ArrayBuffer, convert it
    if (fileBuffer instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(fileBuffer);
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // Use streamifier to create a readable stream and pipe it
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = 'image'
) => {
  try {
    if (!publicId) {
      return new Error('public ID is required for deletion.');
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (response.result === 'not found') {
      console.warn('Media not found on cloudinary:', publicId);
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error deleting media from cloudinary!', error);
    return null;
  }
};
