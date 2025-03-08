import { Like } from '../models/likeModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

export const getAllLikedVideos = catchAsync(async (req, res, next) => {
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
            username: 1,
            avatar: 1,
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

export const getAllLikedComments = catchAsync(async (req, res, next) => {
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
            $unwind: {
              path: '$ownerDetails',
              preserveNullAndEmptyArrays: false,
            },
          },
        ],
      },
    },
    {
      $match: {
        likedComments: { $ne: [] }, // Filter out likes with no matching comments
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
            username: 1,
            avatar: 1,
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

  // Check if the video is already liked by the user
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
    type: 'like',
  });

  if (existingLike) {
    // unlike the video
    await existingLike.deleteOne();

    return res.status(200).json({
      status: 'success',
      isLiked: false,
      message: 'Video unliked!',
    });
  }

  // Remove any exsiting dislike for the video by the user
  await Like.deleteOne({ video: videoId, likedBy: userId, type: 'dislike' });

  // Like the video
  await Like.create({
    video: videoId,
    likedBy: userId,
    type: 'like',
  });

  return res.status(200).json({
    status: 'success',
    isLiked: true,
    isDisliked: false,
    message: 'Video liked!',
  });
});

export const toggleVideoDislike = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);

  if (!isValidId(videoId)) {
    return next(new AppError('Invalid video ID', 400));
  }

  // Check if the video already dislike by the user
  const existingDislike = await Like.findOne({
    video: videoId,
    likedBy: userId,
    type: 'dislike',
  });

  if (existingDislike) {
    // Remove the dilike
    await existingDislike.deleteOne();

    return res.status(200).json({
      status: 'success',
      isDisliked: false,
      message: 'Video undisliked!',
    });
  }

  // Remove any exsiting like for the video
  await Like.deleteOne({ video: videoId, likedBy: userId, type: 'like' });

  // Dislike the video
  await Like.create({
    video: videoId,
    likedBy: userId,
    type: 'dislike',
  });

  return res.status(200).json({
    status: 'success',
    isLiked: false,
    isDisliked: true,
    message: 'Video disliked!',
  });
});

export const toggleCommentLike = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);

  if (!isValidId(commentId)) {
    return next(new AppError('Invalid comment ID', 400));
  }

  // Check if the comment is already liked by the user
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
    type: 'like',
  });

  if (existingLike) {
    // Unlike the comment
    await existingLike.deleteOne();

    return res.status(200).json({
      status: 'success',
      isLiked: false,
      message: 'Comment unliked!',
    });
  }

  // Remove any existing dislike for the comment by the user
  await Like.deleteOne({
    comment: commentId,
    likedBy: userId,
    type: 'dislike',
  });

  // Like the comment
  await Like.create({
    comment: commentId,
    likedBy: userId,
    type: 'like',
  });

  return res.status(200).json({
    status: 'success',
    isLiked: true,
    isDisliked: false,
    message: 'Comment liked!',
  });
});

export const toggleCommentDislike = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const isValidId = (id) => mongoose.isValidObjectId(id);

  if (!isValidId(commentId)) {
    return next(new AppError('Invalid comment ID', 400));
  }

  // Check if the comment is already disliked by the user
  const existingDislike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
    type: 'dislike',
  });

  if (existingDislike) {
    // Remove the dislike
    await existingDislike.deleteOne();

    return res.status(200).json({
      status: 'success',
      isDisliked: false,
      message: 'Comment undisliked!',
    });
  }

  // Remove any existing like for the comment by the user
  await Like.deleteOne({ comment: commentId, likedBy: userId, type: 'like' });

  // Dislike the comment
  await Like.create({
    comment: commentId,
    likedBy: userId,
    type: 'dislike',
  });

  return res.status(200).json({
    status: 'success',
    isLiked: false,
    isDisliked: true,
    message: 'Comment disliked!',
  });
});
