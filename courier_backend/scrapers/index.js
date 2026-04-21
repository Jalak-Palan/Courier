const { scrapeTrackon } = require('./trackon');
const { scrapeDTDC } = require('./dtdc');
const { scrapeShreeMaruti } = require('./shreeMaruti');
const { scrapeShreeAnjani } = require('./shreeAnjani');
const { scrapeShreeNandan } = require('./shreeNandan');

const SCRAPERS = {
  'Trackon': scrapeTrackon,
  'DTDC': scrapeDTDC,
  'Shree Maruti': scrapeShreeMaruti,
  'Shree Anjani': scrapeShreeAnjani,
  'Shree Nandan': scrapeShreeNandan,
};

/**
 * Routes to the correct scraper based on courier name.
 * Returns structured tracking result or null on failure.
 *
 * @param {string} courier - Courier name (must match SCRAPERS keys)
 * @param {string} trackingId - The tracking ID to search
 * @returns {Promise<{ status, location, date, courier } | null>}
 */
async function runScraper(courier, trackingId) {
  const scraperFn = SCRAPERS[courier];
  if (!scraperFn) {
    throw new Error(`No scraper registered for courier: ${courier}`);
  }
  return scraperFn(trackingId);
}

module.exports = { runScraper };
