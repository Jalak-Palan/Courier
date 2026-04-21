const rateLimit = require('express-rate-limit');

const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many tracking requests. Please wait a moment before trying again.',
  },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress,
});

module.exports = { trackLimiter };
