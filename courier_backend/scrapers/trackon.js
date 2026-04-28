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
    // It's a button with name="submit" and text "Track"
    await page.click('button[name="submit"]');

    // Wait for result to load
    // The result often appears in a table or a specific div
    await withTimeout(
      page.waitForSelector('.tracking-result, .track-result, table, #trackingDetails, .consignment-detail, .alert-danger', {
        timeout: 15000,
      }),
      18000
    );

    // Scrape result fields
    const result = await page.evaluate(() => {
      // Helper to find text in labels and get corresponding value
      const getValueByLabel = (label) => {
        const elements = Array.from(document.querySelectorAll('td, th, span, div, p, strong, b, label'));
        const target = elements.find(el => el.innerText.trim().includes(label));
        if (!target) return null;
        
        // Try to get text from next sibling or parent's next column if in a table/grid
        let value = '';
        if (target.nextElementSibling) {
          value = target.nextElementSibling.innerText.trim();
        } else {
          // If no next sibling, maybe it's "Label: Value" in the same element
          value = target.innerText.split(':').pop().trim();
        }
        return value || null;
      };

      const consignmentNo = getValueByLabel('Consignment No') || getValueByLabel('AWB No');
      const dueDate = getValueByLabel('Due Date') || getValueByLabel('Expected Delivery');

      const table = document.querySelector('.table, #trackingDetails table, .tracking-result table');
      const history = [];

      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        // Identify data rows (usually 4 columns: Date, Transaction, Location, Status/Event)
        const dataRows = rows.filter(r => r.querySelectorAll('td').length >= 3);
        
        dataRows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length >= 3) {
            history.push({
              date: cells[0]?.innerText?.trim() || null,
              transaction: cells[1]?.innerText?.trim() || null,
              location: cells[2]?.innerText?.trim() || null,
              event: cells[3]?.innerText?.trim() || (cells.length === 3 ? cells[1]?.innerText?.trim() : null)
            });
          }
        });
      }

      if (history.length === 0) {
        const errorMsg = document.querySelector('.alert-danger, .text-danger, #errorMsg, .alert')?.innerText?.trim();
        if (errorMsg && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('invalid'))) {
          return { error: true, message: errorMsg };
        }
      }

      return {
        consignmentNumber: consignmentNo,
        dueDate: dueDate,
        history: history,
        error: history.length === 0
      };
    });

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
