// app/routes/api.bundle.jsx
import fetch from "node-fetch";

const SHOPIFY_STORE = process.env.SHOPIFY_SHOP; // e.g., myshop.myshopify.com
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

export const action = async ({ request }) => {
  try {
    const { title, items } = await request.json();

    if (!title || !items?.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing title or products" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the bundle product
    const productPayload = {
      product: {
        title,
        body_html: `<strong>Bundle of ${items.length} products</strong>`,
        variants: [{ price: "0.00", sku: `BUNDLE-${Date.now()}` }],
        tags: "bundle",
      },
    };

    const productResponse = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-07/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify(productPayload),
      }
    );

    const productData = await productResponse.json();

    if (!productData.product) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create product bundle" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const bundleProductId = productData.product.id;

    // Add metafields for individual products
    for (const item of items) {
      const metafieldPayload = {
        metafield: {
          namespace: "bundle",
          key: `product_${item.productId}`,
          value: item.quantity,
          type: "number_integer",
        },
      };

      await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2025-07/products/${bundleProductId}/metafields.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify(metafieldPayload),
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, bundleProductId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Bundle creation error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
