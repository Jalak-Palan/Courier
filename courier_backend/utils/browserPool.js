const puppeteer = require('puppeteer');

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

let browserInstance = null;
let idleTimer = null;

/**
 * Returns a shared Puppeteer browser instance.
 * Launches a new one if none exists or the previous was closed.
 */
async function getBrowser() {
  if (browserInstance) {
    // Reset idle timer on each use
    resetIdleTimer();
    return browserInstance;
  }

  console.log('[BrowserPool] Launching new browser instance...');
  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,800',
    ],
  });

  browserInstance.on('disconnected', () => {
    console.log('[BrowserPool] Browser disconnected. Clearing instance.');
    browserInstance = null;
    if (idleTimer) clearTimeout(idleTimer);
  });

  resetIdleTimer();
  return browserInstance;
}

/**
 * Opens a new page from the shared browser.
 * Caller is responsible for closing the page after use.
 */
async function getPage() {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Set a realistic browser user-agent as requested for production
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Block unnecessary resources for speed
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return page;
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (browserInstance) {
      console.log('[BrowserPool] Closing idle browser after 5 minutes...');
      await browserInstance.close().catch(() => {});
      browserInstance = null;
    }
  }, IDLE_TIMEOUT_MS);
}

/**
 * Force-closes the browser (e.g. on server shutdown).
 */
async function closeBrowser() {
  if (idleTimer) clearTimeout(idleTimer);
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

module.exports = { getPage, closeBrowser };
