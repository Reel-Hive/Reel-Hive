import { Subscription } from '../models/subscriptionModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose, { isValidObjectId } from 'mongoose';
import { User } from '../models/userModel.js';

// Updated toggleSubscription
export const toggleSubscription = catchAsync(async (req, res, next) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  // Check if channel ID is valid
  if (!isValidObjectId(channelId)) {
    return next(new AppError('Invalid channel ID', 400));
  }

  // Fetch subscription of the user for this channel
  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (subscription) {
    // If the user already subscribed, we unsubscribe
    const unsubscribed = await Subscription.findByIdAndDelete(subscription._id);

    if (unsubscribed) {
      return res.status(200).json({
        status: 'success',
        message: 'unsubscribed successfully',
        subscribed: false,
      });
    }
  }

  // If no subscription exists, create a new subscription
  const subscribed = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  // Send the response
  return res.status(200).json({
    status: 'success',
    message: 'subscribed successfully',
    subscribed: true,
  });
});

export const getUserChannelSubscribers = catchAsync(async (req, res, next) => {
  const { channelId } = req.params;

  // Check if channel ID is valid
  if (!isValidObjectId(channelId)) {
    return next(new AppError('Invalid channel ID', 400));
  }

  // Fetch all subscriptions for the given channel
  const subscriptions = await Subscription.find({
    channel: new mongoose.Types.ObjectId(channelId),
  });

  // If no subscriptions found
  if (!subscriptions.length) {
    return res.status(200).json({
      status: 'success',
      message: 'No subscribers found',
      subscribers: [],
    });
  }

  // Extract subscriber IDs from subscriptions
  const subscriberIds = subscriptions.map((sub) => sub.subscriber);

  // Fetch subscriber details
  const subscribers = await User.aggregate([
    {
      $match: {
        _id: { $in: subscriberIds },
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedToChannels',
      },
    },
    {
      $addFields: {
        subscribedToChannel: {
          $cond: {
            if: {
              $in: [
                channelId,
                { $ifNull: ['$subscribedToChannels.channel', []] },
              ],
            },
            then: true,
            else: false,
          },
        },
        subscribersCount: {
          $size: '$subscribedToChannels',
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        subscribedToChannel: 1,
        subscribersCount: 1,
      },
    },
  ]);

  // Send the response
  return res.status(200).json({
    status: 'success',
    message: 'subscribers fetched successfully',
    subscribers,
  });
});

export const getSubscribedChannels = catchAsync(async (req, res, next) => {
  const { subscriberId } = req.params;

  // check if ID valid
  if (!isValidObjectId(subscriberId)) {
    return next(new AppError('Invalid subscriber ID', 400));
  }

  // Fetch all subscriptions for the given subscriber
  const subscriptions = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(subscriberId),
  });

  //  If no subscriptions found
  if (!subscriptions.length) {
    return res.status(200).json({
      status: 'success',
      message: 'No subscribed channel found',
      subscribedChannels: [],
    });
  }
  // Extract the channel IDs from subscriptions
  const channelIds = subscriptions.map((sub) => sub.channel);

  // Fetch the channel details with latest video
  const subscribedChannels = await User.aggregate([
    {
      $match: {
        _id: { $in: channelIds },
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: '_id',
        foreignField: 'owner',
        as: 'videos',
      },
    },
    {
      $addFields: {
        latestVideo: {
          $arrayElemAt: ['$videos', -1], // Get the last video
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        latestVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          owner: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          createdAt: 1,
        },
      },
    },
  ]);

  //   Send the respose

  return res.status(200).json({
    status: 'success',
    message: 'subscribed channels fetched successfully',
    subscribedChannels,
  });
});
