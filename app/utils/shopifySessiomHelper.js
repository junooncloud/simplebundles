// app/utils/shopifySessionHelper.js
import shopify from "../shopify.server";

/**
 * Retrieves the shop and access token for the current request.
 * Works with the new @shopify/shopify-app-react-router/server setup.
 */
export async function getAccessTokenForShop(request) {
  try {
    // authenticate.admin() gets the session (shop + accessToken)
    const { session } = await shopify.authenticate.admin(request);

    if (!session?.shop || !session?.accessToken) {
      throw new Error("Session missing shop or access token");
    }

    return {
      shop: session.shop,               // e.g. "my-shop.myshopify.com"
      accessToken: session.accessToken, // used for API calls
    };
  } catch (error) {
    console.error("getAccessTokenForShop error:", error);
    throw new Error("Failed to get shop session");
  }
}
