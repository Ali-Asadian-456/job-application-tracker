import mongoose, { Document, Schema } from "mongoose";

interface ICatalogState extends Document {
  key: string;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogStateSchema = new Schema<ICatalogState>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.CatalogState ||
  mongoose.model<ICatalogState>("CatalogState", CatalogStateSchema);
