const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.model.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiError } = require("../utils/apiError.js");
const { ApiResponse } = require("../utils/apiResponse.js");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../actions/sendEmail.js");
const { getVerificationEmailHtml } = require("../templates/verificationEmail.js");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Refresh or Access Token");
  }
};

// Helper: generate verification token and send email
const sendVerificationEmail = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.verificationToken = hashedToken;
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  const html = getVerificationEmailHtml({
    userName: user.username,
    verificationUrl,
  });

  const result = await sendEmail({
    to: user.email,
    subject: "Verify Your Email — Zorvyn Finance",
    html,
  });

  return result;
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedEmail = await User.findOne({ email });
  if (existedEmail) throw new ApiError(409, "Email already exists");

  const user = await User.create({
    email,
    password,
    username,
    imageUrl: null,
    isVerified: false,
    role: "viewer",       // Default role for new registrations
    status: "active",
  });

  // Send verification email
  await sendVerificationEmail(user);

  const createdUser = await User.findById(user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "Registration successful! Please check your email to verify your account."));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User does not exist");

  // Check if account is active
  if (user.status === "inactive") {
    throw new ApiError(403, "Your account has been deactivated. Please contact an administrator.");
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in. Check your inbox for the verification link.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

  const options = { httpOnly: true, secure: true, sameSite: "None" };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    throw new ApiError(400, "Token and email are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email: decodeURIComponent(email),
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token. Please request a new one.");
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully! You can now log in."));
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email is already verified");

  // Rate limit: don't allow resend if token was sent less than 2 minutes ago
  if (user.verificationTokenExpiry) {
    const tokenAge = Date.now() - (user.verificationTokenExpiry.getTime() - 24 * 60 * 60 * 1000);
    if (tokenAge < 2 * 60 * 1000) {
      throw new ApiError(429, "Please wait at least 2 minutes before requesting another verification email.");
    }
  }

  await sendVerificationEmail(user);

  return res.status(200).json(new ApiResponse(200, {}, "Verification email sent! Please check your inbox."));
});

const guestLogin = asyncHandler(async (req, res) => {
  const GUEST_EMAIL = "guest@zorvyn.demo";

  const user = await User.findOne({ email: GUEST_EMAIL });

  if (!user) {
    throw new ApiError(503, "Demo account is not available right now. Please try again later.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const guestUser = await User.findById(user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

  const options = { httpOnly: true, secure: true, sameSite: "None" };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: guestUser, accessToken, refreshToken }, "Guest login successful! Explore the dashboard."));
});

const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    const options = { httpOnly: true, secure: true, sameSite: "None" };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully",
      });

  } catch (error) {
    return next(new ApiError(500, error.message || "Logout failed"));
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid Refresh Token");
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    const options = { httpOnly: true, secure: true, sameSite: "None" };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserName = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) throw new ApiError(400, "Username field is required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { username } },
    { new: true }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(200, user, "Username Updated Successfully")
  );
});


const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "email field is required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { email } },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

// ──────────────────────────────────────────────
// ADMIN-ONLY ENDPOINTS
// ──────────────────────────────────────────────

/**
 * GET /api/v1/users
 * List all users (admin only)
 * Supports filtering by role and status via query params
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;
  const filter = {};

  if (role && ["viewer", "analyst", "admin"].includes(role)) {
    filter.role = role;
  }
  if (status && ["active", "inactive"].includes(status)) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password -refreshToken -verificationToken -verificationTokenExpiry")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

/**
 * PATCH /api/v1/users/:id/role
 * Update a user's role (admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent admin from changing their own role
  if (id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  ).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, `User role updated to '${role}' successfully`));
});

/**
 * PATCH /api/v1/users/:id/status
 * Update a user's active/inactive status (admin only)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Prevent admin from deactivating themselves
  if (id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own status");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, `User status updated to '${status}' successfully`));
});

module.exports = {
  generateAccessAndRefreshToken,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  updateUserName,
  verifyEmail,
  resendVerification,
  guestLogin,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
};
