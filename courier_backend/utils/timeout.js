/**
 * Wraps a promise and rejects it if it doesn't resolve within `ms` milliseconds.
 * @param {Promise} promise - The async operation to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise}
 */
function withTimeout(promise, ms = 30000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

module.exports = { withTimeout };
