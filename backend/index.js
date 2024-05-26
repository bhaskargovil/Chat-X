import { configDotenv } from "dotenv";
import express from "express";
import { connectionDB } from "./db/connect.js";
import cors from "cors";
import cookieParser from "cookie-parser";

configDotenv({ path: "./.env" });

const app = express();
// sort of middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

connectionDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on ${process.env.PORT}`);
    });
  })
  .catch((e) => {
    throw e;
  });

app.get("/", (req, res) => {
  res.send(`Server is running on ${process.env.PORT}`);
});

// importing all the routes
import authRouter from "./routes/auth.route.js";

// auth routers
app.use("/api/auth", authRouter);
