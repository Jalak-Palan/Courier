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
app.use(cors()); // Allow all origins for production-ready integration
app.use(express.json({ limit: '10kb' }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── GET tracking endpoint (Render Requirements) ─────────────────────────────
app.get('/track', async (req, res) => {
  const { id } = req.query;
  const courier = req.query.courier || 'Trackon';

  if (!id) {
    return res.status(400).json({ error: 'Tracking ID is required' });
  }

  console.log(`[GET Track] courier=${courier} id=${id}`);

  try {
    const result = await runScraper(courier, id);

    if (!result || (result.history && result.history.length === 0)) {
      return res.json([]); // Return empty array if no data found
    }

    // If it's Trackon and has history, return just the history array as requested
    // but the frontend needs consignmentNumber and dueDate too.
    // I'll return the full object if it's our frontend, 
    // but the prompt says "Return JSON format: [ { ... } ]"
    // I'll stick to the requested array format for /track
    if (result.history) {
      return res.json(result.history);
    }

    return res.json([result]); // Fallback for other couriers
  } catch (err) {
    console.error('[Track Error]', err.message);
    return res.status(500).json({ error: 'Tracking failed' });
  }
});

// ── POST tracking endpoint (Backward compatibility) ──────────────────────────
app.post('/api/track', trackLimiter, validateInput, async (req, res) => {
  const { trackingId, courier } = req;

  console.log(`[POST Track] courier=${courier} id=${trackingId}`);

  try {
    const result = await runScraper(courier, trackingId);

    if (!result) {
      return res.status(200).json({
        error: 'Tracking unavailable',
        message: `Could not fetch tracking data from ${courier}.`,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Track Error]', err.message);
    return res.status(500).json({
      error: 'Server error',
      message: 'An internal error occurred.',
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
