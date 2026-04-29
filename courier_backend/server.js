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

const { getCache, setCache } = require('./utils/persistentCache');
const { enqueueRequest } = require('./utils/requestManager');

// ── GET tracking endpoint (Production Reliable) ─────────────────────────────
app.get('/track', async (req, res) => {
  const { id } = req.query;
  const courier = req.query.courier || 'Trackon';

  if (!id) {
    return res.status(400).json({ error: 'Tracking ID is required' });
  }

  const cacheKey = `${courier}:${id}`;

  // 1. Check Persistent Cache (File-based)
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return res.json(cachedData);
  }

  console.log(`[GET Track] courier=${courier} id=${id}`);

  try {
    // 2. Request Locking: Use enqueueRequest to prevent duplicate scrapers
    const data = await enqueueRequest(cacheKey, async () => {
       const result = await runScraper(courier, id);
       
       if (result && result.history && result.history.length > 0) {
         // Only cache if data looks valid (has location)
         const hasLocation = result.history.some(h => h.location && h.location !== 'N/A');
         if (hasLocation) {
           await setCache(cacheKey, result.history);
           return result.history;
         }
       }
       return null;
    });

    if (data) {
      console.log("FINAL DATA [Success]:", JSON.stringify(data, null, 2));
      return res.json(data);
    }

    console.log(`[Trackon] No data found for ${id} after all attempts.`);

    // 3. Fallback to expired Cache if scraping fails
    const expiredData = await getCache(cacheKey); 
    if (expiredData) {
      console.log(`[Fallback] Returning expired cache for ${id}`);
      return res.json(expiredData);
    }

    return res.json([]); 
  } catch (err) {
    console.error('[Track Error]', err.message);
    const expiredData = await getCache(cacheKey);
    if (expiredData) return res.json(expiredData);
    return res.status(500).json({ error: 'Tracking failed', details: err.message });
  }
});

// ── Pre-warm System ─────────────────────────────────────────────────────────
(async () => {
  console.log('[System] Pre-warming Puppeteer...');
  try {
    // Hit a dummy request locally to wake up the scraper
    await runScraper('Trackon', 'DUMMY_ID').catch(() => {});
    console.log('[System] Warm-up complete.');
  } catch (e) {}
})();

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
