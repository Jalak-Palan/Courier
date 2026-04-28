const { getPage } = require('../utils/browserPool');
const { withTimeout } = require('../utils/timeout');

/**
 * Trackon Courier scraper
 * Updated to match new site structure at https://www.trackon.in/courier-tracking
 */
async function scrapeTrackon(trackingId) {
  let page = null;
  try {
    page = await getPage();
    // Navigate to the dedicated tracking page
    await withTimeout(page.goto('https://www.trackon.in/courier-tracking', { waitUntil: 'domcontentloaded' }), 20000);

    // Filter to Single Tracking if needed (though it seems default)
    // The input field ID is awbSingleTrackingId
    await withTimeout(page.waitForSelector('#awbSingleTrackingId', { timeout: 10000 }), 12000);
    
    // Clear and type
    await page.click('#awbSingleTrackingId', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#awbSingleTrackingId', trackingId, { delay: 50 });

    // Click the track button associated with the single tracking input
    await page.click('button[name="submit"]');

    // Wait for 4 seconds as requested to ensure dynamic content loads
    await new Promise(r => setTimeout(r, 4000));

    // Wait for result table to load
    await withTimeout(page.waitForSelector('table', { timeout: 10000 }), 12000);

    // Scrape result fields
    const result = await page.evaluate(() => {
      // Helper to find text in labels and get corresponding value
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

      // Target table rows specifically within tbody to skip header
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const history = [];

      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        // Ensure it's a data row with expected column count
        if (cells.length >= 3) {
          history.push({
            date: cells[0]?.innerText?.trim() || "N/A",
            transaction: cells[1]?.innerText?.trim() || "N/A",
            location: cells[2]?.innerText?.trim() || "N/A",
            event: cells[3]?.innerText?.trim() || "N/A"
          });
        }
      });

      // Log extracted data for debugging (visible in browser console, but we'll log in Node too)
      return {
        consignmentNumber: consignmentNo,
        dueDate: dueDate,
        history: history,
        error: history.length === 0
      };
    });

    // Log the result to the server console as requested
    console.log('[Trackon Result]', JSON.stringify(result, null, 2));

    if (result.error && !result.history?.length) {
      return {
        error: true,
        message: result.message || 'Tracking ID not found or no history available.',
        courier: 'Trackon'
      };
    }

    // Sort history by date descending if not already (most recent first)
    // Trackon usually shows most recent first, but we ensure we have the latest status
    const latest = result.history[0] || {};

    return {
      status: latest.event || latest.transaction || 'Status not available',
      location: latest.location || 'Location not available',
      date: latest.date || 'Date not available',
      consignmentNumber: result.consignmentNumber || trackingId,
      dueDate: result.dueDate || 'N/A',
      history: result.history,
      courier: 'Trackon',
    };
  } catch (err) {
    console.error('[Trackon Scraper]', err.message);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

module.exports = { scrapeTrackon };
