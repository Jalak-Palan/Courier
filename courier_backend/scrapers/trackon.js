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
    // Navigate to homepage with networkidle2 as requested
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
      console.log('[Trackon Debug] Table not found, logging page content...');
      console.log(await page.content());
      throw e;
    }

    // Extra delay as requested (5 seconds)
    await new Promise(r => setTimeout(r, 5000));

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
