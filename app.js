import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Importing routes
import userRoute from './routes/userRoutes.js';
import videoRoute from './routes/videoRoutes.js';
import likeRoute from './routes/likeRoutes.js';
import commentRoute from './routes/commentRoutes.js';

const app = express();

// MIDDLEWARE FOR PARSE JSON
app.use(express.json());
app.use(express.static('public'));

// MIDDLEWARE FOR COOKIES
app.use(cookieParser());

// FOR LOGGING ROUTES
app.use(morgan('dev'));

app.use('/api/v1/users', userRoute);
app.use('/api/v1/videos', videoRoute);
app.use('/api/v1/likes', likeRoute);
app.use('/api/v1/comments', commentRoute);

app.use('/health', (req, res) => {
  return res.json({
    status: 200,
    message: 'App is running successfully without any errors...',
  });
});

export default app;
