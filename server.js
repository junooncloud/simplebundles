const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();

// Use raw body parser for webhook routes so HMAC can be validated against the exact payload
app.use('/webhooks', bodyParser.raw({ type: 'application/json' }));
// Use json parser for normal API endpoints
app.use(bodyParser.json());

function verifyShopifyWebhookRaw(req, res, next) {
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256') || '';
  const rawBody = req.body; // Buffer
  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    console.warn('Webhook body not a raw buffer');
    return res.status(400).send('Invalid body');
  }
  const computedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  if (crypto.timingSafeEqual(Buffer.from(computedHash, 'base64'), Buffer.from(hmacHeader, 'base64'))) {
    // attach parsed body for downstream handlers
    try {
      req.body = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      req.body = {};
    }
    return next();
  } else {
    console.warn('HMAC validation failed');
    return res.status(401).send('HMAC validation failed');
  }
}

app.post('/webhooks/product_update', verifyShopifyWebhookRaw, (req, res) => {
  // Quick response: queue work for later processing
  console.log('Webhook product update for shop:', req.get('X-Shopify-Shop-Domain'));
  // TODO: push to job queue (Bull/Redis, or background worker)
  // Example: increment soldProducts counters, re-evaluate bundles, etc.
  res.status(200).send('ok');
});

// Placeholder OAuth start route - do not use for production. Use official Shopify SDK.
app.get('/auth', (req, res) => {
  res.send('Start OAuth here - use the official Shopify SDK (@shopify/shopify-api) in production');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));