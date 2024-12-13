export const getStreamUrlFromCloudinary = (cloudinaryURL) => {
  if (!cloudinaryURL) {
    throw new AppError('Cloudinary URL required to stream the video', 400);
  }

  try {
    // Generate HLS streaming URL
    const streamUrl = cloudinaryURL
      .replace('/upload', '/upload/hls')
      .replace('.mp4', '.m3u8');

    if (!streamUrl) {
      throw new AppError('Failed to generate stream URL from Cloudinary!', 500);
    }

    return streamUrl;
  } catch (error) {
    throw new AppError(`Error processing stream URL: ${error.message}`, 500);
  }
};
