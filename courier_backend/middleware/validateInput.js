const SUPPORTED_COURIERS = ['Trackon', 'DTDC', 'Shree Maruti', 'Shree Anjani', 'Shree Nandan'];
const TRACKING_ID_REGEX = /^[a-zA-Z0-9\-]{1,50}$/;

function validateInput(req, res, next) {
  const { trackingId, courier } = req.body;

  if (!trackingId || typeof trackingId !== 'string') {
    return res.status(400).json({ error: 'Tracking ID is required.' });
  }

  const trimmed = trackingId.trim();

  if (!TRACKING_ID_REGEX.test(trimmed)) {
    return res.status(400).json({
      error: 'Invalid tracking ID. Only letters, numbers, and hyphens are allowed (max 50 characters).',
    });
  }

  if (!courier || !SUPPORTED_COURIERS.includes(courier)) {
    return res.status(400).json({
      error: `Unsupported courier. Supported: ${SUPPORTED_COURIERS.join(', ')}.`,
    });
  }

  // Attach sanitised values
  req.trackingId = trimmed.toUpperCase();
  req.courier = courier;

  next();
}

module.exports = { validateInput };
