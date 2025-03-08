import express from 'express';
import { search } from '../controllers/searchController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Use for below all routes
router.use(protect);

router.route('/').get(search);

export default router;
