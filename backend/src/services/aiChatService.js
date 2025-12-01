import { hf } from "../config/ai.js";

export const generateAIResponse = async (message) => {
  try {
    const response = await hf.textGeneration({
      model: "microsoft/DialoGPT-medium",
      inputs: message,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false
      }
    });

    return response.generated_text || "I'm here to help! How can I assist you today?";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Sorry, I'm having trouble responding right now. Please try again later.";
  }
};