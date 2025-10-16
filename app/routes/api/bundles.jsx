// app/routes/api/bundles.jsx
import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { connectDB } from "../../db.server";

// Bundle schema
const BundleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    products: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "bundles" }
);

const Bundle = mongoose.models.Bundle || mongoose.model("Bundle", BundleSchema);

// GET → fetch bundles
export const loader = async () => {
  await connectDB();
  const bundles = await Bundle.find().sort({ createdAt: -1 });
  return json({ success: true, bundles });
};

// POST → create bundle
export const action = async ({ request }) => {
  await connectDB();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();

    if (!body.title || !body.products) {
      return json({ success: false, error: "Missing title or products" }, { status: 400 });
    }

    const newBundle = await Bundle.create(body);
    return json({ success: true, bundle: newBundle });
  } catch (err) {
    console.error(err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
};
