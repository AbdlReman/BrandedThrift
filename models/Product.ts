import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: {
      type: String,
      required: true,
      enum: ["PUMA", "NIKE", "ADIDAS", "NEW BALANCE", "REEBOK"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Running", "Lifestyle", "Training"],
    },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    color: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 500 },
    longDescription: { type: String, required: true },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

ProductSchema.pre("save", async function () {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
