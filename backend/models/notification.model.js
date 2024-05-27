import { Schema, model } from "mongoose";

const notificationSchema = Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "unfollow", "unlike"],
    },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
