import { Video } from '../models/videoModel.js';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  processVideoStream,
  cleanupTemporaryFiles,
} from '../middlewares/stream.js';
import AppError from '../utils/appError.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import sendEmail from '../utils/email.js';
import mongoose from 'mongoose';

export const publishVideo = catchAsync(async (req, res, next) => {
  // Get the details from frontend
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === '')) {
    return next(new AppError('All fields are required', 400));
  }

  // get file from local path
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!(videoLocalPath || thumbnailLocalPath)) {
    return next(
      new AppError('Both video and thumbnail files are required!', 400)
    );
  }

  // Upload on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!(videoFile || !thumbnail)) {
    return next(new AppError('Failed to upload file on cloudinary!', 400));
  }

  // save video details to the database
  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    owner: req.user?._id,
    isPublished: false,
  });

  if (!video) {
    return next(new AppError('Faild to upload video!', 500));
  }

  // SEND EMAIL
  const message = `
    Dear ${
      req.user?.name || 'User'
    },\n\nCongratulations! Your video titled "${title}" has been uploaded successfully to Reel Hive.\n\nIt is currently under review and will be published shortly. You can view and manage your uploaded video in your account.\n\nHere are the details of your upload:\n\n- **Title**: ${title}\n\n- **Description**: ${description}\n\n- **Duration**: ${
    videoFile.duration
  } seconds\n\nThank you for being a part of our platform. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Reel Hive Team
  `;

  try {
    await sendEmail({
      email: req.user?.email,
      subject: 'Video uploaded successfully - Reel Hive',
      message,
    });
  } catch (error) {
    return next(
      new AppError(
        'something went wrong while sending the mail. Please try later!'
      )
    );
  }

  return res.status(200).json({
    status: 'success',
    message: 'video uploaded successfully',
    video,
  });
});

export const getVideoById = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    return next(new AppError('Invalid video ID', 400));
  }

  if (!mongoose.isValidObjectId(req.user?._id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'channel',
              as: 'subscribers',
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: '$subscribers',
              },
              isSubscribed: { $in: [req.user?._id, '$subscribers.subscriber'] },
            },
          },
          {
            $project: {
              name: 1,
              'avatar.url': 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        owner: { $first: '$owner' },
        isLiked: { $in: [req.user?._id, '$likes.likedBy'] },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        Comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video || !video.length === 0) {
    return next(new AppError('Video not found', 404));
  }

  const videoDetails = video[0];
  const cloudinaryUrl = videoDetails.videoFile?.url;

  if (!cloudinaryUrl) {
    return next(new AppError('Video URL not found', 500));
  }

  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: { watchHistory: videoId },
  });

  try {
    const { streamUrl, localPath } = await processVideoStream(
      cloudinaryUrl,
      videoId
    );

    // remove file from local
    setTimeout(() => cleanupTemporaryFiles(localPath), 30000);

    return res.status(200).json({
      status: 'success',
      message: 'Video detailed fetched successfully',
      video: {
        ...videoDetails,
        streamUrl,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
