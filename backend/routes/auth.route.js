import express from "express";

const router = express.Router();

router.route("/signup").get((req, res) => {
  res.json({
    message: "Sign up endpoint reached",
  });
});

router.route("/login").get((req, res) => {
  res.json({
    message: "Reached login endpoint",
  });
});

export default router;
