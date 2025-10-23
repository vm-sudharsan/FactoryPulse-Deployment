const cors = require('cors');
require('dotenv').config();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://factory-pulse.netlify.app',
  'https://factory-pulse.netlify.app/',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600,
};

module.exports = cors(corsOptions);
