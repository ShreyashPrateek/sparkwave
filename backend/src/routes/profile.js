import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/:id/profile", authMiddleware, getUserProfile);
router.get("/:id/posts", authMiddleware, getUserPosts);
router.post("/:id/follow", authMiddleware, followUser);
router.post("/:id/unfollow", authMiddleware, unfollowUser);

export default router;
