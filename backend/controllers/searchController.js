import { catchAsync } from '../utils/catchAsync.js';
import { Video } from '../models/videoModel.js';
import AppError from '../utils/appError.js';
import { User } from '../models/userModel.js';

export const search = catchAsync(async (req, res, next) => {
  const { query, sortBy = 'createdAt', sortType = 'desc' } = req.query;

  // Validate query
  if (!query || query.trim() === '') {
    return next(new AppError('Search query cannot be empty', 400));
  }

  // Aggregation pipeline for video search
  const videoPipeline = [
    {
      $search: {
        index: 'search-videos',
        text: {
          query: query,
          path: ['title', 'description'],
        },
      },
    },
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
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
        thumbnail: 1,
        videoFile: 1,
        ownerDetails: 1,
        createdAt: 1,
        views: 1,
        duration: 1,
      },
    },
  ];

  // Aggregation pipeline for Channel search
  const channelPipeline = [
    {
      $search: {
        index: 'search-users',
        text: { query, path: ['name', 'username'] },
      },
    },
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
        subscriberCount: { $size: '$subscribers' },
      },
    },
    {
      $project: {
        name: 1,
        username: 1,
        avatar: 1,
        subscriberCount: 1,
      },
    },
  ];

  // Fetch Videos and Channels
  const videos = await Video.aggregate(videoPipeline);
  const channels = await User.aggregate(channelPipeline);

  // Send the response
  return res.status(200).json({
    status: 'success',
    message: 'Searched video fetched successfully',
    data: {
      videos,
      channels,
    },
  });
});
