// app/entry.client.jsx
import React, { useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "react-router";

import AppBridgeProvider from "@shopify/app-bridge-react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

// This must match the API key from your Shopify Partner Dashboard (under App setup → Client ID)
const shopifyApiKey = import.meta.env.VITE_SHOPIFY_API_KEY;

function ClientApp() {
  useEffect(() => {
    window.__SHOPIFY_API_KEY__ = shopifyApiKey;
  }, []);

  return (
    <PolarisProvider i18n={{}}>
      <AppBridgeProvider
        config={{
          apiKey: shopifyApiKey,
          host: new URLSearchParams(window.location.search).get("host"),
          forceRedirect: true,
        }}
      >
        <RemixBrowser />
      </AppBridgeProvider>
    </PolarisProvider>
  );
}

hydrateRoot(document, <ClientApp />);
