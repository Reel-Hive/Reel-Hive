import { Comment } from '../models/commentModel.js';
import { Video } from '../models/videoModel.js';
import { Like } from '../models/likeModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// export const getVideoComments = catchAsync(async (req, res, next) => {
//   const { videoId } = req.params;

//   // check video exists
//   const videoExists = await Video.findById(videoId);
//   if (!videoExists) {
//     return next(new AppError('Video not found', 404));
//   }

//   // Aggregation pipeline to fetch comments
//   const commentsAggregate = Comment.aggregate([
//     {
//       $match: {
//         video: new mongoose.Types.ObjectId(videoId),
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'owner',
//         foreignField: '_id',
//         as: 'ownerDetails',
//       },
//     },
//     {
//       $lookup: {
//         from: 'likes',
//         localField: '_id',
//         foreignField: 'comment',
//         as: 'commentLikes',
//       },
//     },
//     {
//       $addFields: {
//         totalLikes: { $size: '$commentLikes' },
//         ownerDetails: { $arrayElemAt: ['$ownerDetails', 0] },
//         isLiked: {
//           $in: [req.user?._id, '$commentLikes.likedBy'],
//         },
//       },
//     },
//     {
//       $sort: {
//         createdAt: -1,
//       },
//     },
//     {
//       $project: {
//         content: 1,
//         createdAt: 1,
//         totalLikes: 1,
//         owner: {
//           name: "$ownerDetails.name",
//           username: '$ownerDetails.username',
//           avatar: '$ownerDetails.avatar',
//         },
//         isLiked: 1,
//       },
//     },
//   ]);

//   // Get all comments without pagination
//   const commentsData = await commentsAggregate;

//   // count total comments
//   const totalComments = await Comment.aggregate([
//     { $match: { video: new mongoose.Types.ObjectId(videoId) } },
//   ]).then((res) => res.length);

//   return res.status(200).json({
//     status: 'success',
//     message: 'Comments fetched successfully',
//     data: {
//       totalComments,
//       commentsData,
//     },
//   });
// });

export const getVideoComments = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;

  // check if the video exists
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    return next(new AppError('Video not found', 404));
  }

  // Aggregation pipeline to fetch comments
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
      $lookup: {
        from: 'likes',
        let: { commentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$comment', '$$commentId'] },
              type: 'dislike',
            },
          },
        ],
        as: 'commentDislikes',
      },
    },
    {
      $addFields: {
        totalLikes: { $size: '$commentLikes' },
        totalDislikes: { $size: '$commentDislikes' },
        ownerDetails: { $arrayElemAt: ['$ownerDetails', 0] },
        isLiked: {
          $in: [req.user?._id, '$commentLikes.likedBy'],
        },
        isDisliked: {
          $in: [req.user?._id, '$commentDislikes.likedBy'],
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
        totalDislikes: 1,
        owner: {
          name: '$ownerDetails.name',
          username: '$ownerDetails.username',
          avatar: '$ownerDetails.avatar',
        },
        isLiked: 1,
        isDisliked: 1,
      },
    },
  ]);

  // Get all comments without pagination
  const commentsData = await commentsAggregate;

  // count total comments
  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json({
    status: 'success',
    message: 'Comments fetched successfully',
    data: {
      totalComments,
      commentsData,
    },
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
