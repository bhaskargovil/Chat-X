import express from "express";
import {
  followUnfollow,
  getSuggestedUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.use(verifyAccessToken);
router.route("/profile").post(getUserProfile);
router.route("/follow").post(followUnfollow);
router.route("/suggest").get(getSuggestedUsers);
router.route("/update").post(updateUserProfile);

export default router;
