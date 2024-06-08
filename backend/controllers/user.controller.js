import { User } from "../models/auth.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) throw new ApiError(400, "didn't receive username");

  const user = await User.findOne({ username: username }).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(400, "username doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user profile delivered"));
});

const followUnfollow = asyncHandler(async (req, res) => {
  const user = req.user;
  const { toBeFollowedUserID } = req.body;

  if (!toBeFollowedUserID) throw new ApiError(400, "id missing");

  if (user._id == toBeFollowedUserID)
    throw new ApiError(400, "user can't follow unfollow himself");

  const toBeFollowedUser = await User.findById(toBeFollowedUserID.toString());

  if (!toBeFollowedUser) throw new ApiError(400, "incorrect id");

  const isFollower = toBeFollowedUser.followers.includes(user._id);

  if (isFollower) {
    // unfollow user
    await User.findByIdAndUpdate(toBeFollowedUser._id, {
      $pull: { followers: user._id },
    });
    await User.findByIdAndUpdate(user._id, {
      $pull: { following: toBeFollowedUserID },
    });

    const notification = await Notification.create({
      from: toBeFollowedUser._id,
      to: user._id,
      type: "unfollow",
    });

    if (!notification) throw new ApiError(500, "notification didn't generate");

    return res
      .status(200)
      .json(new ApiResponse(200, { notification }, "unfollowed successfully"));
  } else {
    // follow user
    await User.findByIdAndUpdate(toBeFollowedUser._id, {
      $push: { followers: user._id },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { following: toBeFollowedUserID },
    });

    const notification = await Notification.create({
      from: user._id,
      to: toBeFollowedUser._id,
      type: "follow",
    });

    if (!notification) throw new ApiError(500, "notification didn't generate");

    return res
      .status(200)
      .json(new ApiResponse(200, { notification }, "followed successfully"));
  }
});

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const user = req.user;

  const followedUsers = await User.findById(user._id).select("following");

  const otherUsers = await User.aggregate([
    {
      $match: {
        _id: { $ne: user._id },
      },
    },
    {
      $sample: {
        size: 10,
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ]);

  const notFollowedUsers = otherUsers.filter(
    (user) => !followedUsers.following.includes(user._id)
  );

  const suggestedUsers = notFollowedUsers.slice(0, 4);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { suggestedUsers }, "suggested users list displayed")
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fullname, username, email, currentPassword, bio, link, newPassword } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const user = await User.findById(userId);

  if (profileImg) {
    if (user.profileImage) {
      await cloudinary.uploader.destroy(
        user.profileImage.split("/").pop().split(".")[0]
      );
    }

    const uploadedResponse = await cloudinary.uploader.upload(profileImg);
    profileImg = uploadedResponse.secure_url;
  }

  if (coverImg) {
    if (user.coverImage) {
      await cloudinary.uploader.destroy(
        user.coverImage.split("/").pop().split(".")[0]
      );
    }

    const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    coverImg = uploadedResponse.secure_url;
  }

  if (username) {
    let existingUser = await User.find({ username: username });

    existingUser = existingUser.filter((user) => !(user._id == userId));

    if (existingUser.username == username)
      throw new ApiError(400, "username taken");
  }

  if (email) {
    let existingUser = await User.find({ email: email });

    existingUser = existingUser.filter((user) => !(user._id == userId));

    if (existingUser.email == email) throw new ApiError(400, "email taken");
  }

  let hashedPassword;

  if (currentPassword && newPassword) {
    const isPasswordSame = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordSame) throw new ApiError(400, "incorrect password");
    hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  const newUser = await User.findByIdAndUpdate(
    user._id,
    {
      fullname: fullname || user.fullname,
      email: email || user.email,
      username: username || user.username,
      password: hashedPassword || user.password,
      bio: bio || user.bio,
      link: link || user.link,
      profileImage: profileImg?.url || user.profileImage,
      coverImage: coverImg?.url || user.coverImage,
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, newUser, "profile updated"));
});

export { getUserProfile, followUnfollow, getSuggestedUsers, updateUserProfile };
