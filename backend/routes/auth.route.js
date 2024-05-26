import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyAccessToken, logout);

export default router;
