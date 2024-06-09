import { configDotenv } from "dotenv";
import express from "express";
import { connectionDB } from "./db/connect.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

configDotenv({ path: "./.env" });

const app = express();
// sort of middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const __dirname = path.resolve();

// importing all the routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import notificationRouter from "./routes/notification.route.js";

// auth routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/notifications", notificationRouter);

if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
  connectionDB();
});
