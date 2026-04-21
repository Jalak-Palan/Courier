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
      // Look for the results table specifically
      const table = document.querySelector('.table, #trackingDetails table');
      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        // Usually, the first row is header, subsequent rows are data
        const dataRows = rows.filter(r => r.querySelectorAll('td').length >= 3);
        if (dataRows.length > 0) {
          const lastRow = dataRows[dataRows.length - 1]; // Most recent status
          const cells = Array.from(lastRow.querySelectorAll('td'));
          return {
            date: cells[0]?.innerText?.trim() || null,
            status: cells[1]?.innerText?.trim() || null,
            location: cells[2]?.innerText?.trim() || null
          };
        }
      }

      // Check for common error container
      const errorMsg = document.querySelector('.alert-danger, .text-danger, #errorMsg')?.innerText?.trim();
      if (errorMsg && (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('invalid'))) {
        return { error: true, message: errorMsg };
      }

      return { status: null, location: null, date: null };
    });

    if (result.error) {
      return {
        error: true,
        message: result.message || 'Tracking ID not found or invalid.',
        courier: 'Trackon'
      };
    }

    return {
      status: result.status || 'Status not available',
      location: result.location || 'Location not available',
      date: result.date || 'Date not available',
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
