import express from 'express';
import { protect } from '../middlewares/protect.js';
import { getChannelDetails } from '../controllers/channelController.js';

const router = express.Router();

router.use(protect);

router.route('/:username').get(getChannelDetails);

export default router;
