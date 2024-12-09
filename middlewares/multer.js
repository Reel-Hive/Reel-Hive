import multer from 'multer';

// CREATE FOR IMAGE STORE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const Upload = multer({
  storage,
});
