import express from 'express';
import { protect } from '../middlewares/protect.js';
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(protect); // Apply for all routes

router
  .route('/c/:channelId')
  .post(toggleSubscription)
  .get(getUserChannelSubscribers);

router.route('/u/:subscriberId').get(getSubscribedChannels);

export default router;
