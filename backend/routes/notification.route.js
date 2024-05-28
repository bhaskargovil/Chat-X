import { Router } from "express";
import { verifyAccessToken } from "../middlewares/verifyJWT.js";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyAccessToken);

router.get("/", getNotifications);
router.delete("/", deleteNotifications);

export default router;
