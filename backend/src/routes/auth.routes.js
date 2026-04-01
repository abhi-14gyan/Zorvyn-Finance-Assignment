const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { generateAccessAndRefreshToken } = require("../controllers/user.controller");

// Step 1: Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  async (req, res) => {
    const user = req.user;
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Set cookies and redirect to frontend
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "None" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "None" });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

module.exports = router;
