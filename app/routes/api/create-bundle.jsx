// app/routes/api/create-bundle.jsx
import { json } from "@remix-run/node";
import { getAccessTokenForShop } from "../../utils/shopifySessionHelper";
import { connectDB } from "../../db.server";
import mongoose from "mongoose";

/**
 * IMPORTANT: implement getAccessTokenForShop(request) to return:
 *   { shop, accessToken }
 * This depends on how you store Shopify sessions (Prisma/SQLite). See helper stub below.
 */
async function getAccessTokenForShop(request) {
  // >>> TODO: implement this using your session storage / shopify.server.js utilities.
  // Example: use shopify session helpers to get current session and return its shop and accessToken
  throw new Error("getAccessTokenForShop not implemented. Replace this with session retrieval.");
}

// Mongoose schema (server-side only)
const BundleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [
    {
      productId: String,
      quantity: Number,
    },
  ],
  shopifyProductId: String, // product ID created by Shopify (returned by Admin API)
  shop: String,
  createdAt: { type: Date, default: Date.now },
}, { collection: "bundles" });

const Bundle = mongoose.models.Bundle || mongoose.model("Bundle", BundleSchema);

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  await connectDB();

  try {
    const body = await request.json();
    const { title, items } = body;

    if (!title || !Array.isArray(items) || items.length === 0) {
      return json({ success: false, error: "Missing title or items" }, { status: 400 });
    }

    // get shop and token for this request
    const { shop, accessToken } = await getAccessTokenForShop(request);
    if (!shop || !accessToken) {
      return json({ success: false, error: "Unable to get shop session/token" }, { status: 401 });
    }

    // Build GraphQL mutation to create a new product (bundle) in shop
    // Customize title/description/variants as you like. Here we create a basic product
    const lines = items.map((it, idx) => `Product ${idx + 1}: ${it.productId} (qty ${it.quantity})`).join("\n");
    const productInput = {
      title,
      bodyHtml: `Bundle of products:\n${lines}`,
      // set vendor/tags etc if you want
      variants: [
        {
          price: "0.00", // set price later or compute aggregated price
          sku: `bundle-${Date.now()}`,
          inventoryPolicy: "deny", // optional
        },
      ],
      published: false // keep unpublished until merchant edits price, optional
    };

    // GraphQL productCreate mutation
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            variants(first:1) { edges { node { id sku price } } }
          }
          userErrors { field message }
        }
      }
    `;

    const graphqlResp = await fetch(`https://${shop}/admin/api/2025-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: mutation, variables: { input: productInput } }),
    });

    const graphqlJson = await graphqlResp.json();

    // check for errors
    if (graphqlJson.errors) {
      console.error("GraphQL errors:", graphqlJson.errors);
      return json({ success: false, error: "Shopify GraphQL error" }, { status: 500 });
    }

    const createResult = graphqlJson.data?.productCreate;
    if (!createResult || (createResult.userErrors && createResult.userErrors.length)) {
      console.error("Shopify userErrors:", createResult?.userErrors);
      return json({ success: false, error: createResult?.userErrors?.map(u=>u.message).join(", ") || "Shopify user error" }, { status: 500 });
    }

    const shopifyProductId = createResult.product.id; // GraphQL gid e.g. gid://shopify/Product/123
    // Save bundle into MongoDB
    const saved = await Bundle.create({
      title,
      items,
      shopifyProductId,
      shop,
    });

    return json({ success: true, bundle: saved });
  } catch (err) {
    console.error("create-bundle failed:", err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
};
