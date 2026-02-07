import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
