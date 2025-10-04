import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/create", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);
router.delete("/:id", authMiddleware, deletePost);

export default router;
