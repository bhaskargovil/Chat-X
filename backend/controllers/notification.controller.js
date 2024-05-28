import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

const getNotifications = asyncHandler(async (req, res) => {
  const user = req.user;

  const notification = await Notification.find({ to: user._id }).populate({
    path: "from",
    select: "username fullname profileImg",
  });

  if (!notification) throw new ApiError(500, "notification db error");

  await Notification.updateMany({ to: user._id }, { read: true });

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "notifications read"));
});

const deleteNotifications = asyncHandler(async (req, res) => {
  const user = req.user;

  const notification = await Notification.deleteMany({
    to: user._id,
    read: true,
  });

  if (!notification) throw new ApiError(500, "notification db error");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "notifications deleted successfully"));
});

export { getNotifications, deleteNotifications };
