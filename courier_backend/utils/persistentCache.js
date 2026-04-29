const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, '../data/cache.json');
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Simple file-based cache for multi-instance consistency.
 */
async function getCache(key) {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    const cache = JSON.parse(data);
    const item = cache[key];

    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
      return item.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function setCache(key, data) {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });

    let cache = {};
    try {
      const existing = await fs.readFile(CACHE_FILE, 'utf8');
      cache = JSON.parse(existing);
    } catch (e) {
      // Ignore read errors or empty files
    }

    cache[key] = {
      timestamp: Date.now(),
      data: data
    };

    // Cleanup expired items
    const now = Date.now();
    for (const k in cache) {
      if (now - cache[k].timestamp > CACHE_DURATION) {
        delete cache[k];
      }
    }

    // Atomic write (sort of) by writing to a string first then to file
    const cacheStr = JSON.stringify(cache);
    await fs.writeFile(CACHE_FILE, cacheStr, 'utf8');
  } catch (err) {
    console.error('[PersistentCache] Error saving cache:', err.message);
  }
}

module.exports = { getCache, setCache };
