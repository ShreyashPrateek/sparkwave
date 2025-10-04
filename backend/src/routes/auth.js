import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

const router = express.Router();

/* Helpers */
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP || "15m",
  });

const generateRefreshToken = (userId, tokenId) =>
  jwt.sign({ id: userId, tokenId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXP || "30d",
 });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  path: "/api/auth/refresh", // limit cookie to refresh route domain path
  // maxAge will be set when sending cookie
};

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password || !username) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    res.status(201).json({ message: "Registered", user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGIN: returns accessToken + sets refreshToken cookie */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const tokenId = uuidv4();
    const refreshToken = generateRefreshToken(user._id, tokenId);
    const hashed = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000));

    // Save hashed token in DB
    await RefreshToken.create({ token: hashed, user: user._id, expiresAt });

    // Set cookie (HttpOnly)
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: expiresAt.getTime() - Date.now() });

    res.json({ accessToken, user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* REFRESH: rotate refresh token */
router.post("/refresh", async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body.refreshToken || req.header("x-refresh-token");
    if (!incoming) return res.status(401).json({ message: "No refresh token" });

    // Verify token signature
    let payload;
    try {
      payload = jwt.verify(incoming, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const hashed = hashToken(incoming);
    const tokenRecord = await RefreshToken.findOne({ token: hashed, user: payload.id });

    if (!tokenRecord || tokenRecord.revoked) {
      // Potential reuse detection => revoke all user tokens (optional)
      return res.status(401).json({ message: "Refresh token revoked or not found" });
    }

    // Rotate token: mark old revoked + issue new
    tokenRecord.revoked = true;
    // generate new
    const newTokenId = uuidv4();
    const newRefreshToken = generateRefreshToken(payload.id, newTokenId);
    const newHashed = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000));

    tokenRecord.replacedBy = newHashed;
    await tokenRecord.save();

    await RefreshToken.create({ token: newHashed, user: payload.id, expiresAt: newExpiresAt });

    // set new cookie
    res.cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: newExpiresAt.getTime() - Date.now() });

    const accessToken = generateAccessToken({ _id: payload.id });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGOUT */
router.post("/logout", async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body.refreshToken;
    if (incoming) {
      const hashed = hashToken(incoming);
      await RefreshToken.findOneAndUpdate({ token: hashed }, { revoked: true });
    }
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
