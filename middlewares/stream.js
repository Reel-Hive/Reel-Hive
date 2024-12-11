import AppError from '../utils/appError.js';

export const getStreamUrlFromCloudinary = (cloudinaryURL) => {
  if (!cloudinaryURL) {
    return new AppError('Cloudinary URL is required to generate a stream', 400);
  }

  try {
    // Cloudinary's adaptive streaming options
    const streamUrl = cloudinaryURL.replace(
      '/upload/',
      '/upload/pg:0,f_auto,q_auto/'
    );

    if (!streamUrl) {
      return new AppError('Failed to generate stream URL from cloudinary', 500);
    }

    return streamUrl;
  } catch (error) {
    return new AppError(`Error processing stream URL: ${error.message}`, 500);
  }
};
