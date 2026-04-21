require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { trackLimiter } = require('./middleware/rateLimiter');
const { validateInput } = require('./middleware/validateInput');
const { runScraper } = require('./scrapers/index');
const { closeBrowser } = require('./utils/browserPool');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['POST'],
}));
app.use(express.json({ limit: '10kb' }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Main tracking endpoint ──────────────────────────────────────────────────
app.post('/api/track', trackLimiter, validateInput, async (req, res) => {
  const { trackingId, courier } = req;

  console.log(`[Track] courier=${courier} id=${trackingId}`);

  try {
    const result = await runScraper(courier, trackingId);

    if (!result) {
      return res.status(200).json({
        error: 'Tracking unavailable',
        message: `Could not fetch tracking data from ${courier}. The courier website may be slow or unavailable. Try visiting their site directly.`,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Track Error]', err.message);
    return res.status(500).json({
      error: 'Server error',
      message: 'An internal error occurred. Please try again later.',
    });
  }
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Courier tracking backend running on http://localhost:${PORT}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');
  await closeBrowser();
  server.close(() => {
    console.log('[Server] Closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
