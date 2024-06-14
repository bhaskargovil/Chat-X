import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/auth.model.js";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPost = asyncHandler(async (req, res) => {
  const user = req.user;

  const { text } = req.body;
  let { img } = req.body;

  if (!text) throw new ApiError(400, "post should have some text");

  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }

  const post = await Post.create({
    user: user._id,
    text,
    img,
  });

  if (!post) throw new ApiError(500, "post db error");

  return res
    .status(200)
    .json(new ApiResponse(200, post, "post created successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.body;

  if (!postId) throw new ApiError(400, "post id is required");

  const post = await Post.findById(postId);

  if (!(post.user == user._id.toString()))
    throw new ApiError(400, "user is not the owner of this post");

  if (post.img)
    await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "post deleted successfully"));
});

const commentOnPost = asyncHandler(async (req, res) => {
  const user = req.user;

  const { text, postId } = req.body;

  if (!text || !postId) throw new ApiError(400, "missing fields");

  const post = await Post.findByIdAndUpdate(postId, {
    $push: {
      comments: {
        text,
        user: user._id,
      },
    },
  });

  if (!post) throw new ApiError(500, "post db error");

  return res
    .status(200)
    .json(new ApiResponse(200, post.comments, "comment added successfully"));
});

const likeUnlikePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.body;

  if (!postId) throw new ApiError(400, "postId missing");

  const post = await Post.findById(postId);

  if (!post) throw new ApiError(400, "incorrect postId");

  const alreadyLiked = post.likes.includes(user._id);

  let notification;

  if (alreadyLiked) {
    await User.findByIdAndUpdate(user._id, {
      $pull: {
        likedPost: post._id,
      },
    });
    await Post.findByIdAndUpdate(post._id, {
      $pull: {
        likes: user._id,
      },
    });
    notification = await Notification.create({
      from: user._id,
      to: post.user,
      type: "unlike",
    });
    return res
      .status(200)
      .json(new ApiResponse(200, notification, "unliked successfully"));
  } else {
    await User.findByIdAndUpdate(user._id, {
      $push: {
        likedPost: post._id,
      },
    });
    await Post.findByIdAndUpdate(postId, {
      $push: {
        likes: user._id,
      },
    });
    notification = await Notification.create({
      from: user._id,
      to: post.user,
      type: "like",
    });
    return res
      .status(200)
      .json(new ApiResponse(200, notification, "liked successfully"));
  }
});

const getAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "-password -refreshToken",
    })
    .populate({
      path: "comments.user",
      select: "-password -refreshToken",
    });

  if (allPosts.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "no posts to display"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allPosts, "posts delivered"));
});

const getAllLikedPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const allLikedPosts = await Post.find({ _id: { $in: user.likedPost } })
    .populate({
      path: "user",
      select: "-password -refreshToken",
    })
    .populate({
      path: "comments.user",
      select: "-password -refreshToken",
    });

  return res
    .status(200)
    .json(new ApiResponse(200, allLikedPosts, "all liked posts displayed"));
});

const getFollowingPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError(400, "incorrect userID");

  const following = user.following;

  const post = await Post.find({ user: { $in: following } }).sort({
    createdAt: -1,
  });

  return res.status(200).json(new ApiResponse(200, post, "all posts shown"));
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(200, "user not found");

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "comments.user",
      select: "-password",
    });

  return res.status(200).json(new ApiResponse(200, posts, "posts shown"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId, postId } = req.body;

  if (!commentId || !postId) throw new ApiError(400, "missing data");

  const post = await Post.findById(postId);

  if (!post) throw new ApiError(500, "internal db error, can't find post");

  const newPost = await Post.findByIdAndUpdate(
    postId,
    {
      $pull: {
        comments: {
          _id: commentId,
        },
      },
    },
    { new: true }
  );

  if (!newPost) throw new ApiError(500, "db error post not updated");

  return res.status(200).json(new ApiResponse(200, newPost, "comment deleted"));
});

export {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getAllLikedPosts,
  getFollowingPosts,
  getUserPosts,
  deleteComment,
};
