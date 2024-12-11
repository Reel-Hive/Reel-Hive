import { Comment } from '../models/commentModel.js';
import { Video } from '../models/videoModel.js';
import { Like } from '../models/likeModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

export const getVideoComments = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // check video exists
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    return next(new AppError('Video not found', 404));
  }

  // Aggregation pipleline to fetch comments
  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'commentLikes',
      },
    },
    {
      $addFields: {
        totalLikes: { $size: '$commentLikes' },
        ownerDetails: { $arrayElemAt: ['$ownerDetails', 0] },
        isLiked: {
          $in: [req.user?._id, '$commentLikes.likedBy'],
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        totalLikes: 1,
        owner: {
          name: 1,
          username: 1,
          avatar: 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const paginationsOptions = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  //   Paginate the commit result
  const commentsData = await Comment.aggregatePaginate(
    commentsAggregate,
    paginationsOptions
  );

  return res.status(200).json({
    status: 'success',
    message: 'Commets fetched successfully',
    data: commentsData,
  });
});

export const createComment = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!content?.trim()) {
    return next(new AppError('Comment content is required!', 400));
  }

  // FInd the video
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError('Video not found', 404));
  }

  // create comment
  const newComment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!newComment) {
    return next(new AppError('Failed to add comment, please try later!', 500));
  }

  return res.status(200).json({
    status: 'success',
    message: 'comment added successfully',
    comment: newComment,
  });
});

export const updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!content?.trim()) {
    return next(new AppError('comment content required!', 400));
  }

  // check comment exists
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  // check that current user owns that comment
  if (comment.owner.toString() !== userId.toString()) {
    return next(
      new AppError('you are not authorized to update this comment', 403)
    );
  }

  // update the comment
  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updateComment) {
    return next(new AppError('Failed to update comment', 500));
  }

  return res.status(200).json({
    status: 'success',
    message: 'comment updated successfully',
    updateComment,
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  // check comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError('comment not found', 404));
  }

  // check that current user owns that comment
  if (comment.owner.toString() !== userId.toString()) {
    return next(
      new AppError('you are not authorized to update this comment', 403)
    );
  }

  //   Delete like of which comment you wnat to like
  await Like.deleteMany({
    comment: commentId,
    likedBy: req.user,
  });

  //   delete comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    status: 'success',
    message: 'comment deleted successfully',
    commentId,
  });
});
