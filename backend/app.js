import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Importing routes
import userRoute from './routes/userRoutes.js';
import videoRoute from './routes/videoRoutes.js';
import likeRoute from './routes/likeRoutes.js';
import commentRoute from './routes/commentRoutes.js';
import subscriptionRoute from './routes/subscriptionRoutes.js';
import searchRoute from './routes/searchRoute.js';
import channelRoute from './routes/channelRoutes.js';

const app = express();

// MIDDLEWARE FOR PARSE JSON
app.use(express.json());
app.use(express.static('public'));

// MIDDLEWARE FOR COOKIES
app.use(cookieParser());

// FOR FONRTEND ACCESS
const allowedOrigins = [
  process.env.SERVER_LOCAL_CLIENT_URL,
  process.env.SERVER_PRODUCTION_CLIENT_URL,
].filter(Boolean); // Remove undefined values

console.log('Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// FOR LOGGING ROUTES
app.use(morgan('common'));

app.use('/api/v1/users', userRoute);
app.use('/api/v1/videos', videoRoute);
app.use('/api/v1/likes', likeRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/subscriptions', subscriptionRoute);
app.use('/api/v1/searches', searchRoute);
app.use('/api/v1/channels', channelRoute);

app.use('/health', (req, res) => {
  return res.json({
    status: 200,
    message: 'App is running successfully without any errors...',
  });
});

export default app;
