const { getPage } = require('../utils/browserPool');
const { withTimeout } = require('../utils/timeout');

/**
 * DTDC Courier scraper
 * Site: https://www.dtdc.in/tracking/tracking_results.asp
 */
async function scrapeDTDC(trackingId) {
  let page = null;
  try {
    page = await getPage();
    await withTimeout(
      page.goto('https://www.dtdc.in/tracking/tracking_results.asp', { waitUntil: 'domcontentloaded' }),
      20000
    );

    // Wait for input
    await withTimeout(page.waitForSelector('input[name="strCnno"], #strCnno, input[name="awbno"], input[type="text"]', { timeout: 10000 }), 12000);

    const inputSel = await page.$('input[name="strCnno"]') ||
                     await page.$('#strCnno') ||
                     await page.$('input[name="awbno"]') ||
                     await page.$('input[type="text"]');

    if (!inputSel) throw new Error('Input field not found');

    await inputSel.click({ clickCount: 3 });
    await inputSel.type(trackingId, { delay: 50 });

    // Submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
      page.click('input[type="submit"], button[type="submit"], #btnSearch, .track-btn').catch(() => inputSel.press('Enter')),
    ]);

    // Wait for result table
    await withTimeout(
      page.waitForSelector('table, .track-result, .tracking-detail, #tblConsignment', { timeout: 15000 }),
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
          location = cells[1]?.innerText?.trim() || null;
          status = cells[2]?.innerText?.trim() || cells[1]?.innerText?.trim() || null;
        }
      }

      const getText = (selectors) => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.innerText.trim()) return el.innerText.trim();
        }
        return null;
      };

      status = status || getText(['.status', '.consignment-status', '[class*="status"]']);
      location = location || getText(['.location', '.city', '[class*="location"]']);
      date = date || getText(['.date', '[class*="date"]']);

      return { status, location, date };
    });

    return {
      status: result.status || 'Status not available',
      location: result.location || 'Location not available',
      date: result.date || 'Date not available',
      courier: 'DTDC',
    };
  } catch (err) {
    console.error('[DTDC Scraper]', err.message);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

module.exports = { scrapeDTDC };
