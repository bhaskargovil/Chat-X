import { User } from "../models/auth.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshTokens = async function (userID) {
  try {
    const user = await User.findById(userID);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error.message;
  }
};

const cookieOptions = {
  httpOnly: true,
};

const signup = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (
    fullname == "" ||
    username == "" ||
    email == "" ||
    password == "" ||
    !fullname ||
    !email ||
    !username ||
    !password
  )
    throw new ApiError(400, "values missing");

  const emailRegexPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegexPattern.test(email))
    throw new ApiError(400, "invalid email format");

  const existingUser = await User.findOne({ username: username });
  if (existingUser) throw new ApiError(400, "username already exists");

  const exitingEmail = await User.findOne({ email: email });
  if (exitingEmail) throw new ApiError(400, "user email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username,
    fullname: fullname,
    email: email,
    password: hashedPassword,
  });

  if (!user) throw new ApiError(500, "user didn't create (db error)");

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user._id
  );

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, newUser, "Signup successfull"));
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) throw new ApiError(400, "username/email required");
  if (!password) throw new ApiError(400, "password is required");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(400, "incorrect username/email");

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw new ApiError(400, "incorrect password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, newUser, "login successful"));
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  const newUser = await User.findByIdAndUpdate(
    user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  if (!newUser) throw new ApiError(500, "db error");

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "logout successful"));
});

export { signup, login, logout };
