import express from "express";
import {
  followUnfollow,
  getSuggestedUsers,
  getUserProfile,
  updateUserProfile,
  searchProfile,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.use(verifyAccessToken);
router.route("/profile").post(getUserProfile);
router.route("/follow").post(followUnfollow);
router.route("/suggest").get(getSuggestedUsers);
router.route("/update").post(updateUserProfile);
router.route("/search").post(searchProfile);

export default router;
