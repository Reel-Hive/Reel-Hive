import AppError from '../utils/appError.js';

export const getStreamUrlFromCloudinary = (cloudinaryURL) => {
  if (!cloudinaryURL) {
    throw new AppError('Cloudinary URL required to stream the video', 400);
  }

  try {
    // Ensure the video is in a valid format
    const validFormats = /\.(mp4|mov|avi)$/; 
    if (!validFormats.test(cloudinaryURL)) {
      throw new AppError(
        'Invalid video format. Only MP4, MOV, or AVI supported.',
        400
      );
    }

    console.log('Generated Stream URL:', cloudinaryURL);

    // Return the raw video URL
    return cloudinaryURL;
  } catch (error) {
    throw new AppError(`Error processing stream URL: ${error.message}`, 500);
  }
};
