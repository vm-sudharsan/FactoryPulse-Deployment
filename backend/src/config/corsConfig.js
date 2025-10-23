const cors = require('cors');
require('dotenv').config();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://factory-pulse.netlify.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600,
};

module.exports = cors(corsOptions);
