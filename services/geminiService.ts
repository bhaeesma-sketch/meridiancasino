
import { GoogleGenAI } from "@google/genai";

export async function getQuantumAdvice(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the 'Quantum Oracle' of a high-tech casino. Your tone is futuristic, mysterious, and encouraging. Give gambling advice, explain game rules, or make 'lucky predictions'.",
        temperature: 0.9,
      }
    });
    return response.text || "The Oracle is silent today...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Quantum Link is unstable. Try again later.";
  }
}
