const { getPage } = require('../utils/browserPool');
const { withTimeout } = require('../utils/timeout');

/**
 * Shree Maruti Courier scraper
 * Site: https://shreemaruti.com/track-shipment/
 */
async function scrapeShreeMaruti(trackingId) {
  let page = null;
  try {
    page = await getPage();
    await withTimeout(
      page.goto('https://shreemaruti.com/track-shipment/', { waitUntil: 'domcontentloaded' }),
      20000
    );

    // Wait for and fill tracking input
    await withTimeout(page.waitForSelector('input[type="text"], input[name*="track"], input[id*="track"], input[placeholder*="track" i]', { timeout: 10000 }), 12000);

    const inputEl = await page.$('input[name*="track"]') ||
                    await page.$('input[id*="track"]') ||
                    await page.$('input[placeholder*="track" i]') ||
                    await page.$('input[type="text"]');

    if (!inputEl) throw new Error('Input field not found');

    await inputEl.click({ clickCount: 3 });
    await inputEl.type(trackingId, { delay: 50 });

    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
      page.click('button[type="submit"], input[type="submit"], .track-btn, .btn-primary').catch(() => inputEl.press('Enter')),
    ]);

    // Wait for tracking results
    await withTimeout(
      page.waitForSelector('.tracking-result, .track-info, table, .shipment-status, .result', { timeout: 15000 }),
      18000
    );

    const result = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      let status = null, location = null, date = null;

      if (rows.length > 1) {
        const lastRow = rows[rows.length - 1];
        const cells = Array.from(lastRow.querySelectorAll('td'));
        if (cells.length >= 2) {
          date = cells[0]?.innerText?.trim() || null;
          status = cells[1]?.innerText?.trim() || null;
          location = cells[2]?.innerText?.trim() || null;
        }
      }

      const getText = (selectors) => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.innerText.trim()) return el.innerText.trim();
        }
        return null;
      };

      status = status || getText(['.status', '.shipment-status', '[class*="status"]', 'h3', 'h4']);
      location = location || getText(['.location', '.city', '[class*="location"]']);
      date = date || getText(['.date', '[class*="date"]', 'time']);

      return { status, location, date };
    });

    return {
      status: result.status || 'Status not available',
      location: result.location || 'Location not available',
      date: result.date || 'Date not available',
      courier: 'Shree Maruti',
    };
  } catch (err) {
    console.error('[Shree Maruti Scraper]', err.message);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

module.exports = { scrapeShreeMaruti };
