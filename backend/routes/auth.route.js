import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/verifyJWT.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyAccessToken, logout);
router.route("/getcurrentuser").get(verifyAccessToken, getCurrentUser);
router.route("/refreshtoken").get(verifyRefreshToken, refreshAccessToken);

export default router;
