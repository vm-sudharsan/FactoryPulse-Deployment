const cors = require('cors');
require('dotenv').config();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://factory-pulse.netlify.app',
  'http://localhost:3000'
].filter(Boolean); // Remove undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(
      allowedOrigin => allowedOrigin && allowedOrigin.toLowerCase() === origin.toLowerCase()
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600
};

module.exports = cors(corsOptions);
