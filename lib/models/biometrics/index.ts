import mongoose, { Schema, model } from "mongoose";

interface biometrics {
  matricNo: number;
  jambImg: string;
  selfie: string;
  signature: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
}

const biometricsSchema = new Schema<biometrics>(
  {
    matricNo: {
      type: Number,
      required: true,
      unique: true,
    },
    jambImg: {
      type: String,
    },
    selfie: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    confidence: {type: Number},
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
  },
  {
    timestamps: true,
  }
);

export const Biometrics =
  mongoose.models.biometrics || model("biometrics", biometricsSchema);
