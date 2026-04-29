/**
 * Manages active tracking requests to prevent duplicate scrapers for the same ID.
 */
const activeRequests = new Map();

async function enqueueRequest(key, scrapeFn) {
  // If a request for this key is already running, return the existing promise
  if (activeRequests.has(key)) {
    console.log(`[RequestManager] Joining active request for ${key}`);
    return activeRequests.get(key);
  }

  // Otherwise, start a new request and store its promise
  const promise = scrapeFn()
    .then(result => {
      activeRequests.delete(key);
      return result;
    })
    .catch(err => {
      activeRequests.delete(key);
      throw err;
    });

  activeRequests.set(key, promise);
  return promise;
}

module.exports = { enqueueRequest };
