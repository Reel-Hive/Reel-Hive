import { catchAsync } from '../utils/catchAsync.js';
import { Video } from '../models/videoModel.js';
import AppError from '../utils/appError.js';

export const searchVideos = catchAsync(async (req, res, next) => {
  const { query, sortBy = 'createdAt', sortType = 'desc' } = req.query;

  // Validate query
  if (!query || query.trim() === '') {
    return next(new AppError('Search query cannot be empty', 400));
  }

  // Aggregation pipeline for search
  const pipeline = [
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

  // Fetch Videos
  const videos = await Video.aggregate(pipeline);

  if (!videos || videos.length === 0) {
    return next(new AppError('No videos found for this query!', 404));
  }

  // Send the response
  return res.status(200).json({
    status: 'success',
    message: 'Searched video fetched successfully',
    data: {
      videos,
    },
  });
});
