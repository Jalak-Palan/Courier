const { getPage } = require('../utils/browserPool');
const { withTimeout } = require('../utils/timeout');

/**
 * Trackon Courier scraper
 * Updated to match new site structure at https://www.trackon.in/courier-tracking
 */
async function scrapeTrackon(trackingId) {
  let page = null;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`[Trackon] Attempt ${attempts} for ID: ${trackingId}`);
      page = await getPage();
      
      // Navigate to homepage with networkidle2
      await withTimeout(page.goto('https://www.trackon.in/', { waitUntil: 'networkidle2' }), 30000);

      // Find and type in the tracking ID
      await withTimeout(page.waitForSelector('#awbSingleTrackingId', { timeout: 15000 }), 18000);
      
      // Clear and type
      await page.click('#awbSingleTrackingId', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type('#awbSingleTrackingId', trackingId, { delay: 100 });

      // Click the track button
      await page.click('button[name="submit"]');

      // Dynamic wait strategy: Wait for table rows specifically
      try {
        await page.waitForSelector('table tbody tr', { timeout: 15000 });
      } catch (e) {
        const title = await page.title();
        console.log(`[Trackon Debug] Table not found on attempt ${attempts}. Page Title: ${title}`);
        // Log a snippet of the page to see if there is an error message
        const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
        console.log(`[Trackon Debug] Body Snippet: ${bodyText}`);
        
        if (attempts < maxAttempts) {
          if (page) await page.close().catch(() => {});
          continue; // Retry
        }
        throw e;
      }

      // Extra delay for dynamic content (5 seconds)
      await new Promise(r => setTimeout(r, 5000));

      // Scrape result fields
      const result = await page.evaluate((trackingId) => {
        const getValueByLabel = (label) => {
          const elements = Array.from(document.querySelectorAll('td, th, span, div, p, strong, b, label'));
          const target = elements.find(el => el.innerText.trim().includes(label));
          if (!target) return null;
          let value = '';
          if (target.nextElementSibling) {
            value = target.nextElementSibling.innerText.trim();
          } else {
            value = target.innerText.split(':').pop().trim();
          }
          return value || null;
        };

        const consignmentNo = getValueByLabel('Consignment No') || getValueByLabel('AWB No');
        const dueDate = getValueByLabel('Due Date') || getValueByLabel('Expected Delivery');

        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const history = [];

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length >= 3) {
            const date = cells[0]?.innerText?.trim() || "N/A";
            const trans = cells[1]?.innerText?.trim() || "N/A";
            const loc = cells[2]?.innerText?.trim() || "N/A";
            const evt = cells[3]?.innerText?.trim() || "N/A";

            history.push({
              date: date,
              transaction: trans,
              location: loc,
              event: evt === "N/A" && cells.length === 3 ? loc : evt
            });
          }
        });

        return {
          consignmentNumber: consignmentNo || trackingId,
          dueDate: dueDate || "N/A",
          history: history,
          error: history.length === 0
        };
      }, trackingId);

      // Validate data: if history is empty or looks bad on first attempt, retry
      if ((!result.history || result.history.length === 0 || result.history.some(h => h.location === "N/A")) && attempts < maxAttempts) {
        console.log('[Trackon] Results incomplete or empty. Retrying...');
        if (page) await page.close().catch(() => {});
        continue;
      }

      console.log('[Trackon Result]', JSON.stringify(result, null, 2));

      const latest = result.history[0] || {};
      return {
        status: latest.event || latest.transaction || 'Status not available',
        location: latest.location || 'Location not available',
        date: latest.date || 'Date not available',
        consignmentNumber: result.consignmentNumber,
        dueDate: result.dueDate,
        history: result.history,
        courier: 'Trackon',
      };
    } catch (err) {
      console.error(`[Trackon Scraper Attempt ${attempts}]`, err.message);
      if (attempts >= maxAttempts) return []; // Return empty array on final failure
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }
  return []; // Fallback
}

module.exports = { scrapeTrackon };
