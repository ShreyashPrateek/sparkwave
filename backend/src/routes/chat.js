import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getMessages, getChats, markAsRead } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", authMiddleware, getChats);
router.get("/:userId", authMiddleware, getMessages);
router.put("/:userId/read", authMiddleware, markAsRead);

export default router;