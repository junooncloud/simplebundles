# simplebundles

Shopify app to create simple and seamless bundles to sell on your ecommerce store.

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - npm install
3. Start local dev server:
   - npm run dev
4. Expose local server to Shopify using ngrok and set your app's App URL and Whitelisted redirection URL(s).
5. Install the app on a development store and test creating bundles.

## Recommended stack

- Backend: Node.js (Express or Koa) or Next.js
- Frontend: React with Shopify Polaris + App Bridge
- DB: Postgres (sessions, shops, bundles)
- Webhooks: register on install, verify HMAC on receive
- Billing: Shopify Billing API (if you charge)

## Environment variables

See `.env.example`.

## Production checklist

- HMAC verification for webhooks
- Secure storage of access tokens (DB/Redis)
- Use official Shopify SDK for OAuth + API calls
- Implement billing if app is paid
- Add tests and CI