import express from 'express';
import { searchVideos } from '../controllers/searchController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Use for below all routes
router.use(protect);

router.route('/').get(searchVideos);

export default router;
