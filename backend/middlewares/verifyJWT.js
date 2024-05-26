import { User } from "../models/auth.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const inputToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!inputToken) throw new ApiError(400, "tokens didn't received");

  const decodedToken = jwt.verify(inputToken, process.env.ACCESS_TOKEN_SECRET);
  if (!decodedToken) throw new ApiError(400, "token is not correct");

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(500, "user db error");

  req.user = user;
  next();
});

const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const inputToken = req.cookies?.refreshToken;
  if (!inputToken) throw new ApiError(400, "didn't receive refresh token");

  const decodedToken = jwt.verify(inputToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decodedToken) throw new ApiError(400, "incorrect refresh token");

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(400, "incorrect id in refresh token");

  req.user = user;
  next();
});

export { verifyAccessToken, verifyRefreshToken };
