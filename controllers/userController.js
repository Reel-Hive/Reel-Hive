import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { User } from '../models/userModel.js';
import sendEmail from '../utils/email.js';
import mongoose from 'mongoose';

export const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // SEND EMAIL
  const message = `Dear ${user.name},\n\nYour account has been successfully deleted. We're sorry to see you go. If you have any feedback or questions, please contact our support team.\n\nBest regards,\nReel Hive Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Account deleted successfully',
      message,
    });
  } catch (error) {
    return next(
      new AppError('There was an error sending email. Try again later!', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    data: null,
    message: 'Your account deleted successfully!',
  });
});

export const getUserChannelProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  if (!username.trim()) {
    return next(new AppError('username is missing', 400));
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
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
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channelsSubscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    return next(new AppError('channel does not exists', 404));
  }

  return res.status(200).json({
    status: 'success',
    message: 'User channel fetched successfully',
    data: channel[0],
  });
});

export const getWatchHistory = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('ser Id  required'));
  }

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
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
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    message: 'Watch history fetched successfully',
    data: user[0].watchHistory,
  });
});
