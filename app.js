import express from 'express';

const app = express();

// MIDDLEWARE FOR PARSE JSON
app.use(express.json());

app.use('/health', (req, res) => {
  return res.json({
    status: 200,
    message: 'App is running successfully without any errors...',
  });
});

export default app;
