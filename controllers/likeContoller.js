import { Like } from '../models/likeModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

export const getLikedVideos = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User not authenicated!', 401));
  }
  const likedVideosAggregate = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'likedVideo',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'ownerDetails',
            },
          },
          {
            $unwind: '$ownerDetails',
          },
        ],
      },
    },
    {
      $match: {
        likedVideo: { $ne: [] },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: 1,
          'videoFile.url': 1,
          'thumbnail.url': 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
            name: 1,
          },
        },
      },
    },
  ]);

  if (!likedVideosAggregate) {
    return next(new AppError('Failed to fetch liked videos', 500));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Liked videos fetched successfully',
    data: likedVideosAggregate,
  });
});

export const getLikedComments = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) {
    return next(new AppError('Uer not authenticated!', 401));
  }

  const likedCommentsAggregate = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        comment: { $ne: null }, // Ensure we're dealing with liked comments
      },
    },
    {
      $lookup: {
        from: 'comments',
        localField: 'comment',
        foreignField: '_id',
        as: 'likedComments',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'ownerDetails',
            },
          },
          {
            $unwind: '$ownerDetails',
          },
        ],
      },
    },
    {
      $sort: {
        'likedComment.createdAt': -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedComments: {
          _id: 1,
          content: 1,
          createdAt: 1,
          video: 1,
          owner: 1,
          ownerDetails: {
            name: 1,
          },
        },
      },
    },
  ]);

  if (!likedCommentsAggregate) {
    return next(new AppError('Failed to fetch liked comments', 500));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Liked comments fetched successfully',
    data: likedCommentsAggregate,
  });
});

export const toggleVideoLike = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);

  if (!isValidId) {
    return next(new AppError('Invalid video ID', 400));
  }

  // Check video is alrady liked by user
  const existLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existLike) {
    // unlike the video
    await existLike.deleteOne();

    return res.status(200).json({
      status: 'success',
      isLiked: false,
      message: 'video unliked!',
    });
  }

  // LIKE THE VIDEO
  await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res.status(200).json({
    status: 'success',
    message: 'video liked',
    isLiked: true,
  });
});

export const toggleCommentLike = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);

  if (!isValidId) {
    return next(new AppError('Invalid comment ID', 400));
  }

  // check comment is already liked by user
  const existLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existLike) {
    // unlike the comment
    await existLike.deleteOne();

    return res.status(200).json({
      status: 'success',
      message: 'comment unliked!',
      isLiked: false,
    });
  }

  // Like the comment
  await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  return res.status(200).json({
    status: 'success',
    message: 'comment liked',
    isLiked: true,
  });
});