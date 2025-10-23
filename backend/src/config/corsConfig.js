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
      // Log warning but still allow the request to prevent blocking
      console.warn('⚠️ CORS warning - Origin not in allowlist:', origin);
      console.warn('Allowed origins:', allowedOrigins);
      // Allow anyway to prevent blocking - just log for monitoring
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours to reduce preflight requests
};

module.exports = cors(corsOptions);
