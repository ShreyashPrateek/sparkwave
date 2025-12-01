import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { generateAIResponse } from "../services/aiChatService.js";
import { getOrCreateAIBot } from "../utils/aiBot.js";
import { checkToxicity } from "../services/moderationService.js";

// Get chat messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate("sender", "username name avatar")
    .populate("receiver", "username name avatar")
    .sort({ createdAt: 1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent chats list
export const getChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all messages where user is sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { receiver: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
              then: "$receiver",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$text" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$receiver", new mongoose.Types.ObjectId(currentUserId)] },
                    { $eq: ["$read", false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: "$user._id",
          username: "$user.username",
          name: "$user.name",
          avatar: "$user.avatar",
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message to AI assistant
export const sendToAI = async (req, res) => {
  try {
    const { text } = req.body;
    const currentUserId = req.user.id;

    // Check for toxic content
    const toxicityCheck = await checkToxicity(text);
    if (toxicityCheck.isToxic) {
      return res.status(400).json({ 
        error: "Message violates community guidelines",
        reason: "toxic_content"
      });
    }

    // Get or create AI bot
    const aiBot = await getOrCreateAIBot();
    if (!aiBot) {
      return res.status(500).json({ error: "AI assistant unavailable" });
    }

    // Save user message
    const userMessage = new Message({
      sender: currentUserId,
      receiver: aiBot._id,
      text: text.trim()
    });
    await userMessage.save();
    await userMessage.populate("sender", "username name avatar");
    await userMessage.populate("receiver", "username name avatar");

    // Generate AI response
    const aiResponse = await generateAIResponse(text);

    // Save AI response
    const aiMessage = new Message({
      sender: aiBot._id,
      receiver: currentUserId,
      text: aiResponse,
      isAI: true
    });
    await aiMessage.save();
    await aiMessage.populate("sender", "username name avatar");
    await aiMessage.populate("receiver", "username name avatar");

    res.json({ userMessage, aiMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};