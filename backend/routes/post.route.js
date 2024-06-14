import express from "express";
import { verifyAccessToken } from "../middlewares/verifyJWT.js";
import {
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  getAllLikedPosts,
  getAllPosts,
  getFollowingPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.use(verifyAccessToken);
router.post("/create", createPost);
router.post("/delete", deletePost);
router.post("/comment", commentOnPost);
router.post("/like", likeUnlikePost);
router.get("/allposts", getAllPosts);
router.get("/alllikedposts/:username", getAllLikedPosts);
router.get("/allfollowingposts", getFollowingPosts);
router.get("/posts/:username", getUserPosts);
router.post("/deletecomment", deleteComment);

export default router;
