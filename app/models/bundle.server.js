import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  products: [
    {
      productId: String,
      quantity: Number,
    },
  ],
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Bundle = mongoose.model("Bundle", bundleSchema);
