import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtPriceCents?: number;
  imageUrl: string;
  badges: string[];
  highlights: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    priceCents: {
      type: Number,
      required: true,
    },
    compareAtPriceCents: {
      type: Number,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    badges: [
      {
        type: String,
        trim: true,
      },
    ],
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      required: true,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ isFeatured: -1, createdAt: -1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
