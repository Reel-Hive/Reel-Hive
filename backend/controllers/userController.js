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
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #0d1117; color: #ffffff; text-align: center; border-radius: 10px;">
    <h1 style="color: #ff4d4d; font-size: 36px; font-weight: bold;">⚠️ Account Deleted Successfully!</h1>
    
    <p style="font-size: 18px; color: #ddd;">Hello <span style="color: #00bfff; font-weight: bold;">${user.name}</span>,</p>
    
    <p style="font-size: 16px; color: #ccc; max-width: 600px; margin: auto;">
      We're sorry to see you go! 😢 Your <span style="color: #ffcc00; font-weight: bold;">Reel Hive</span> account has been <span style="color: #ff4d4d; font-weight: bold;">permanently deleted</span> upon request.  
      If this was a mistake or you have any concerns, please <span style="color: #00ff99; font-weight: bold;">reach out to our support team immediately.</span>  
    </p>

    <h2 style="color: #ffcc00; font-size: 24px; margin-top: 30px;">💡 What Happens Now?</h2>
    <div style="text-align: left; display: inline-block; max-width: 600px; font-size: 16px;">
      <p>❌ <span style="color: #ff4d4d; font-weight: bold;">Your account & data have been erased.</span> You can no longer access your videos, likes, and subscriptions.</p>
      <p>📌 <span style="color: #00ff99; font-weight: bold;">Your email is still valid.</span> You can always sign up again anytime!</p>
      <p>🚀 <span style="color: #00bfff; font-weight: bold;">Reel Hive is always evolving.</span> We’d love to have you back in the future!</p>
    </div>

    <h2 style="color: #007bff; font-size: 24px; margin-top: 30px;">💬 We Value Your Feedback!</h2>

    <p style="font-size: 16px; color: #bbb; max-width: 600px; margin: auto;">
      We'd love to know <span style="color: #ffcc00; font-weight: bold;">why you decided to leave.</span> Your feedback helps us improve.  
      Click below to share your thoughts! 📝  
    </p>

    <p style="margin-top: 30px;">
      <a href="https://yourwebsite.com/feedback" style="display: inline-block; padding: 14px 28px; background-color: #ffcc00; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">📝 Give Feedback</a>
    </p>

    <hr style="border: 1px solid #333; margin: 30px 0;">

    <p style="font-size: 14px; color: #aaa;">
      Need help? <a href="mailto:support@reelhive.com" style="color: #ffcc00; text-decoration: none;">Contact Support</a>
    </p>

    <p style="font-size: 14px; color: #aaa;">
      🎬 Thank you for being part of <span style="color: #ffcc00; font-weight: bold;">Reel Hive.</span> We hope to see you again soon!  
    </p>

    <p style="font-size: 16px; color: #ffcc00; font-weight: bold;">🚀 Stay creative & keep exploring! <br>The Reel Hive Team</p>
  </div>
`;

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
