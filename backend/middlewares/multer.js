import multer from 'multer';

// Use memory storage for avoid saving files locally
const storage = multer.memoryStorage();

export const Upload = multer({
  storage,
});
