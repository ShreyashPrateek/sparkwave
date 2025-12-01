import User from "../models/User.js";

export const getOrCreateAIBot = async () => {
  try {
    let aiBot = await User.findOne({ username: "sparkwave_ai" });
    
    if (!aiBot) {
      aiBot = await User.create({
        username: "sparkwave_ai",
        name: "Spark Wave AI Assistant",
        email: "ai@sparkwave.com",
        password: "dummy_password_not_used",
        bio: "🤖 AI Assistant - Ask me anything!",
        avatar: "🤖"
      });
    }
    
    return aiBot;
  } catch (error) {
    console.error("Error creating AI bot:", error);
    return null;
  }
};