import { hf } from "../config/ai.js";

export const checkToxicity = async (text) => {
  try {
    const response = await hf.textClassification({
      model: "unitary/toxic-bert",
      inputs: text
    });

    const toxicScore = response.find(r => r.label === "TOXIC")?.score || 0;
    const isToxic = toxicScore > 0.7; // 70% threshold

    return {
      isToxic,
      score: toxicScore,
      confidence: Math.max(...response.map(r => r.score))
    };
  } catch (error) {
    console.error("Moderation Error:", error);
    // Fail safe - allow content if moderation fails
    return { isToxic: false, score: 0, confidence: 0 };
  }
};