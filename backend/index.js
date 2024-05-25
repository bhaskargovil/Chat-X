import { configDotenv } from "dotenv";
import express from "express";
import { connectionDB } from "./db/connect.js";

configDotenv({ path: "./.env" });

const app = express();

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
