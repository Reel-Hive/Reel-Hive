import { Video } from '../models/videoModel.js';
import { User } from '../models/userModel.js';
import { Like } from '../models/likeModel.js';
import { Comment } from '../models/commentModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { getStreamUrlFromCloudinary } from '../middlewares/stream.js';
import AppError from '../utils/appError.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import sendEmail from '../utils/email.js';
import mongoose from 'mongoose';

export const publishVideo = catchAsync(async (req, res, next) => {
  // Get the details from frontend
  const { title, description, isPublished } = req.body;
  if ([title, description].some((field) => field?.trim() === '')) {
    return next(new AppError('All fields are required', 400));
  }

  // get file from local path
  const videoLocalPath = req.files?.videoFile?.[0]?.buffer;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.buffer;

  if (!(videoLocalPath && thumbnailLocalPath)) {
    return next(
      new AppError('Both video and thumbnail files are required!', 400)
    );
  }

  // Upload on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath.buffer, 'video');
  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalPath.buffer,
    'image'
  );

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
    isPublished: isPublished || false,
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
    data: {
      video,
    },
  });
});

export const getVideoById = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);
  if (!isValidId(videoId)) {
    return next(new AppError('Invalid video ID', 400));
  }
  if (!isValidId(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  // Fetch video details
  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
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
              subscribersCount: { $size: '$subscribers' },
              isSubscribed: { $in: [userId, '$subscribers.subscriber'] },
            },
          },
          {
            $project: {
              name: 1,
              avatar: 1,
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
        isLiked: { $in: [userId, '$likes.likedBy'] },
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

  if (!video || video.length === 0) {
    return next(new AppError('Video not found', 404));
  }

  const videoDetails = video[0];
  const cloudinaryUrl = videoDetails.videoFile?.url;

  if (!cloudinaryUrl) {
    return next(new AppError('Video URL not found', 500));
  }

  // Update view count and user watch history
  await Promise.all([
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }),
    User.findByIdAndUpdate(userId, { $addToSet: { watchHistory: videoId } }),
  ]);

  // Fetch the streaming URL from cloudinary
  try {
    const streamUrl = getStreamUrlFromCloudinary(cloudinaryUrl);

    // Send response
    return res.status(200).json({
      status: 'success',
      message: 'Video details fetched successfully',
      video: {
        ...videoDetails,
        streamUrl,
      },
    });
  } catch (error) {
    return next(
      new AppError('Failed to fetch stream URL from cloudinary', 500)
    );
  }
});

export const getAllVideos = catchAsync(async (req, res, next) => {
  const { query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

  // Use mongoDB aggregation pipeline with pagination logic
  const pipeline = [];

  if (query) {
    pipeline.push({
      $search: {
        index: 'search-videos',
        text: {
          query: query,
          path: ['title', 'description'],
        },
      },
    });
  }

  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return next(new AppError('Invalid userId', 400));
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({
    $match: { isPublished: true },
  });

  // Sortig by the specified field
  pipeline.push({
    $sort: {
      [sortBy]: sortType === 'asc' ? 1 : -1,
    },
  });

  // Add lookup for owner details
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: '_id',
      as: 'ownerDetails',
      pipeline: [
        {
          $project: {
            name: 1,
            username: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  pipeline.push({ $unwind: '$ownerDetails' });

  // Count total videos
  const totalVideos = await Video.aggregate(pipeline).then((res) => res.length);

  const videos = await Video.aggregate(pipeline);

  // send response
  return res.status(200).json({
    status: 'success',
    message: 'Videos fetched successfully',
    data: {
      totalVideos,
      videos,
    },
  });
});

export const getUserVideos = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  // Check if username is provided
  if (!username) {
    return next(new AppError('Username is required', 400));
  }

  // Find the user by username
  const user = await User.findOne({ username });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const userId = user._id;

  // Fetch the videos
  const userVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$ownerDetails',
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        isPublished: 1,
        owner: 1,
        ownerDetails: 1,
      },
    },
  ]);

  if (!userVideos || userVideos.length === 0) {
    return next(new AppError('No videos found for this user', 404));
  }

  // Send the response
  return res.status(200).json({
    status: 'success',
    message: 'User videos fetched successfully',
    data: {
      videos: userVideos,
    },
  });
});

export const updateVideo = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user?._id;

  // check video id is correct
  if (!videoId) {
    return next(new AppError('Invalid video ID', 400));
  }

  // title and description fields are not empty
  if (!(title || description)) {
    return next(new AppError('title and description are required', 400));
  }

  // fetch video
  const video = await Video.findById(videoId);

  // check if video exists
  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  // check owner is same
  if (video?.owner.toString() !== userId.toString()) {
    return next(
      new AppError('You are not authorized to update this video', 403)
    );
  }

  // store old thumbnail public ID if it exists
  const deleteOldThumbnail = video.thumbnail?.public_id;

  let thumbnail;

  // update thumbnail if a new one is uploaded
  if (req.file) {
    const thumbnailLocalPath = req.file?.buffer;

    if (!thumbnailLocalPath) {
      return next(new AppError('Thumbnail is required', 400));
    }

    thumbnail = await uploadOnCloudinary(thumbnailLocalPath, 'image');
  }

  // update the video without changing the thumbnail if no new thumbnail is uploaded
  const updatedData = {
    title,
    description,
  };

  if (thumbnail) {
    updatedData.thumbnail = {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    };
  }

  // update the video in the database
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updatedData },
    { new: true }
  );

  if (!updatedVideo) {
    return next(new AppError('Failed to update the video', 500));
  }

  // delete the old thumbnail if a new one was uploaded
  if (deleteOldThumbnail && thumbnail) {
    try {
      await deleteFromCloudinary(deleteOldThumbnail, 'image');
    } catch (error) {
      return next(
        new AppError('Failed to delete old thumbnail from Cloudinary', 400)
      );
    }
  }

  // send the response
  return res.status(200).json({
    status: 'success',
    message: 'Video updated successfully',
    updatedVideo,
  });
});

export const deleteVideo = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  // fetch video
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError('Video not found', 400));
  }

  // check owner is same
  if (video?.owner.toString() !== userId.toString()) {
    return next(
      new AppError("you are not authorized to delete this video', 403 ")
    );
  }

  // Delete data of video
  await Promise.all([
    deleteFromCloudinary(video.thumbnail.public_id, 'image'),
    deleteFromCloudinary(video.videoFile.public_id, 'video'),
    Like.deleteMany({ video: videoId }),
    Comment.deleteMany({ video: videoId }),
    video.deleteOne(),
  ]);

  // send response
  return res.status(200).json({
    status: 'success',
    message: 'video deleted succeefully',
    videoId,
  });
});

export const togglePublishStatus = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  // check video Id
  if (!videoId) {
    return next(new AppError('Invalid video ID', 400));
  }

  // check video exist
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError('Video not found', 400));
  }

  // check owner is same
  if (video?.owner.toString() !== userId.toString()) {
    return next(
      new AppError("you are not authorized to delete this video', 403 ")
    );
  }

  const updatePublishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    {
      new: true,
    }
  );

  // send response
  return res.status(200).json({
    status: 'success',
    message: 'Video publish status updated successfully',
    data: {
      isPublished: updatePublishStatus.isPublished,
    },
  });
});
