import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/userModel.js';
import { Video } from '../models/videoModel.js';
import { Subscription } from '../models/subscriptionModel.js';
import AppError from '../utils/appError.js';

export const getChannelDetails = catchAsync(async (req, res, next) => {
  const { channelId } = req.params;
  const loggedInUserId = req.user._id;

  if (!channelId) {
    return next(new AppError('Channel ID not found!', 400));
  }

  // Find channels details
  const channel = await User.findById(channelId).select(
    'name username avatar coverImage'
  );

  if (!channel) {
    return next(new AppError('Channel not found', 404));
  }

  // fetch variable name from channel
  const { name, username, avatar, coverImage } = channel;

  // Count subscribers & subscriptions
  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });
  const subscriptionCount = await Subscription.countDocuments({
    subscriber: channelId,
  });

  // Logged-in user is subscribed to this channel
  const isSubscribed = await Subscription.exists({
    subscriber: loggedInUserId,
    channel: channelId,
  });

  // Fetch all the videos of the channel
  const videos = await Video.find({ owner: channelId, isPublished: true })
    .sort({ createdAt: -1 }) // show the latest video first
    .select('title views createdAt thumbnail.url');

  // Send Repsonse
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
