import Notification from "../models/Notification.js";

export const createNotification = async (io, onlineUsers, { recipient, sender, type, message, postId = null }) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    const notification = new Notification({
      recipient,
      sender,
      type,
      message,
      postId
    });

    await notification.save();
    await notification.populate("sender", "username name avatar");

    // Send real-time notification if user is online
    const recipientSocketId = onlineUsers.get(recipient.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};