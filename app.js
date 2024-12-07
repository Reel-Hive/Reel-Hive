import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

// MIDDLEWARE FOR PARSE JSON
app.use(express.json());

// FOR LOGGING ROUTES
app.use(morgan('dev'));

app.use('/health', (req, res) => {
  return res.json({
    status: 200,
    message: 'App is running successfully without any errors...',
  });
});

export default app;
