import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';
import { Video } from '../models/videoModel.js';
import { Subscription } from '../models/subscriptionModel.js';
import AppError from '../utils/appError.js';

export const getChannelDetails = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const loggedInUserId = req.user._id;

  if (!username) {
    return next(new AppError('Username not provided!', 400));
  }

  // Find channel details using username
  const channel = await User.findOne({ username }).select(
    '_id name username avatar coverImage'
  );

  if (!channel) {
    return next(new AppError('Channel not found', 404));
  }

  const { _id: channelId, name, avatar, coverImage } = channel;

  // Count subscribers & subscriptions
  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });
  const subscriptionCount = await Subscription.countDocuments({
    subscriber: channelId,
  });

  // Check if logged-in user is subscribed to this channel
  const isSubscribed = await Subscription.exists({
    subscriber: loggedInUserId,
    channel: channelId,
  });

  // Fetch all videos of the channel
  const videos = await Video.find({ owner: channelId, isPublished: true })
    .sort({ createdAt: -1 })
    .select('title views createdAt thumbnail.url');

  // Send Response
  return res.status(200).json({
    status: 'success',
    message: 'Channel details fetched successfully.',
    data: {
      name,
      username,
      avatar,
      coverImage,
      subscriberCount,
      subscriptionCount,
      totalVideos: videos.length,
      isSubscribed: !!isSubscribed,
      videos,
    },
  });
});
